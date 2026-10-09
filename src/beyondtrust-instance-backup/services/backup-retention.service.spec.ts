import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { BeyondtrustInstanceBackupEntity } from '../repositories/entities';
import { BeyondtrustInstanceBackupRepositoryService } from '../repositories/services/beyondtrust-instance-backup-repository.service';
import { BackupRetentionService } from './backup-retention.service';

const DAY = 24 * 60 * 60 * 1000;
const now = new Date('2026-10-01T04:05:00Z');

describe('BackupRetentionService', () => {
    let root: string;
    let rows: BeyondtrustInstanceBackupEntity[];
    let repository: { findAllNewestFirstPerInstance: jest.Mock; deleteById: jest.Mock };
    let keepLatest: number;
    let service: BackupRetentionService;

    const backup = (id: number, instance: number, ageDays: number, withFile = true) => {
        const relativePath = `bt-backups/${id}.nsb`;
        if (withFile) {
            writeFileSync(join(root, relativePath), 'backup');
        }
        const entity = BeyondtrustInstanceBackupEntity.createWithoutId(instance, relativePath);
        entity.id = id;
        entity.creationDate = new Date(now.getTime() - ageDays * DAY);
        rows.push(entity);
    };
    const exists = (id: number) => fs.existsSync(join(root, `bt-backups/${id}.nsb`));
    const deletedIds = () => repository.deleteById.mock.calls.map(([id]) => id as number);

    beforeEach(() => {
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
        root = mkdtempSync(join(tmpdir(), 'backup-retention-'));
        mkdirSync(join(root, 'bt-backups'));
        rows = [];
        keepLatest = 1;
        repository = {
            // Sorted like the real query: per instance, newest first.
            findAllNewestFirstPerInstance: jest.fn(() =>
                Promise.resolve(
                    [...rows].sort(
                        (a, b) =>
                            a.beyondtrustInstanceId - b.beyondtrustInstanceId ||
                            b.creationDate.getTime() - a.creationDate.getTime(),
                    ),
                ),
            ),
            deleteById: jest.fn().mockResolvedValue(undefined),
        };
        service = new BackupRetentionService(
            {} as DataSource,
            {
                storage: { rootPath: root },
                get backupRetention() {
                    return { retentionDays: 90, keepLatest, distributedLockEnabled: false };
                },
            } as unknown as AppConfigService,
            repository as unknown as BeyondtrustInstanceBackupRepositoryService,
        );
    });

    afterEach(() => {
        rmSync(root, { recursive: true, force: true });
        jest.restoreAllMocks();
    });

    it('deletes files and rows older than 90 days and keeps newer ones', async () => {
        backup(1, 1, 10);
        backup(2, 1, 100);
        backup(3, 1, 200);

        const report = await service.run(now);

        expect(report).toEqual(expect.objectContaining({ status: 'completed', deleted: 2, keptAsLatest: 0 }));
        expect(deletedIds().sort()).toEqual([2, 3]);
        expect([exists(1), exists(2), exists(3)]).toEqual([true, false, false]);
    });

    it('keeps the newest backup of an instance even when it is older than 90 days', async () => {
        backup(4, 2, 150);
        backup(5, 2, 300);
        backup(6, 3, 10);

        const report = await service.run(now);

        expect(report).toEqual(expect.objectContaining({ deleted: 1, keptAsLatest: 1 }));
        expect(deletedIds()).toEqual([5]);
        expect(exists(4)).toBe(true);
    });

    it('deletes strictly with BACKUP_RETENTION_KEEP_LATEST=0', async () => {
        keepLatest = 0;
        backup(7, 4, 150);

        await service.run(now);

        expect(deletedIds()).toEqual([7]);
    });

    it('deletes the row of a backup whose file is already gone', async () => {
        backup(8, 1, 10);
        backup(9, 1, 120, false);

        const report = await service.run(now);

        expect(report).toEqual(expect.objectContaining({ deleted: 1, missingFiles: 1 }));
        expect(deletedIds()).toEqual([9]);
    });

    it('keeps the row when the file cannot be deleted', async () => {
        backup(10, 1, 10);
        backup(11, 1, 120);
        jest.spyOn(fs.promises, 'unlink').mockRejectedValueOnce(Object.assign(new Error('denied'), { code: 'EACCES' }));

        const report = await service.run(now);

        expect(report).toEqual(expect.objectContaining({ deleted: 0, failures: 1 }));
        expect(repository.deleteById).not.toHaveBeenCalled();
    });

    it('never deletes a file outside the storage root', async () => {
        backup(12, 1, 10);
        const outside = BeyondtrustInstanceBackupEntity.createWithoutId(1, '../outside.nsb');
        outside.id = 13;
        outside.creationDate = new Date(now.getTime() - 120 * DAY);
        rows.push(outside);
        const unlink = jest.spyOn(fs.promises, 'unlink');

        const report = await service.run(now);

        expect(report.failures).toBe(1);
        expect(unlink).not.toHaveBeenCalled();
        expect(repository.deleteById).not.toHaveBeenCalled();
    });

    it('does not run twice at the same time', async () => {
        let release: (value: BeyondtrustInstanceBackupEntity[]) => void = () => undefined;
        repository.findAllNewestFirstPerInstance.mockImplementationOnce(
            () => new Promise((resolve) => (release = resolve)),
        );

        const first = service.run(now);
        const second = await service.run(now);
        release([]);
        await first;

        expect(second.status).toBe('skipped');
    });
});
