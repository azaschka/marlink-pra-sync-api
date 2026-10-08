import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { NamedLockUtility } from '../../shared/utilities/named-lock.utility';
import { BeyondtrustInstanceBackupEntity } from '../repositories/entities';

export interface BackupRetentionReport {
    readonly status: 'completed' | 'skipped' | 'failed';
    readonly deleted: number;
    /** Rows whose file was already gone; the row was deleted. */
    readonly missingFiles: number;
    /** Older than the retention, but kept as one of the newest backups of their instance. */
    readonly keptAsLatest: number;
    /** Files that could not be deleted; their rows were kept. */
    readonly failures: number;
    readonly reason?: string;
}

/**
 * Deletes BeyondTrust backups older than BACKUP_RETENTION_DAYS (default 90): first the file (a missing file counts
 * as deleted), then the metadata row; when the file cannot be deleted the row is kept and the failure reported.
 * The newest BACKUP_RETENTION_KEEP_LATEST backups (default 1) of every instance are kept regardless of age, so an
 * instance without recent successful backups keeps its last one. Runs daily, never twice at the same time.
 */
@Injectable()
export class BackupRetentionService {
    private static readonly LOCK_NAME = 'pra-sync:retention:backups';
    private static readonly LOCK_HOLD_IN_MS = 30 * 60 * 1000;
    private static readonly DAY_IN_MS = 24 * 60 * 60 * 1000;

    private readonly logger = new Logger('Retention');
    private running = false;

    constructor(
        private readonly dataSource: DataSource,
        private readonly appConfigService: AppConfigService,
    ) {}

    public async run(now: Date = new Date()): Promise<BackupRetentionReport> {
        if (this.running) {
            return BackupRetentionService.skipped('a run is already active in this process');
        }

        this.running = true;

        try {
            const lock = await NamedLockUtility.tryAcquire(
                this.dataSource,
                BackupRetentionService.LOCK_NAME,
                BackupRetentionService.LOCK_HOLD_IN_MS,
                this.appConfigService.backupRetention.distributedLockEnabled,
            );

            if (!lock) {
                return BackupRetentionService.skipped('a run is active in another Sync API instance');
            }

            try {
                return await this.deleteExpired(now);
            } finally {
                await lock.release();
            }
        } catch (error) {
            const reason = error instanceof Error ? error.message : String(error);
            this.logger.error(`[retention] backups: failed: ${reason}`);

            return { status: 'failed', deleted: 0, missingFiles: 0, keptAsLatest: 0, failures: 0, reason };
        } finally {
            this.running = false;
        }
    }

    private async deleteExpired(now: Date): Promise<BackupRetentionReport> {
        const { retentionDays, keepLatest } = this.appConfigService.backupRetention;
        const cutoff = now.getTime() - retentionDays * BackupRetentionService.DAY_IN_MS;
        const repository = this.dataSource.getRepository(BeyondtrustInstanceBackupEntity);
        const backups = await repository.find({
            select: { id: true, beyondtrustInstanceId: true, backupFilePath: true, creationDate: true },
            order: { beyondtrustInstanceId: 'ASC', creationDate: 'DESC', id: 'DESC' },
        });
        const seenPerInstance = new Map<number, number>();
        let deleted = 0;
        let missingFiles = 0;
        let keptAsLatest = 0;
        let failures = 0;

        for (const backup of backups) {
            const rank = (seenPerInstance.get(backup.beyondtrustInstanceId) ?? 0) + 1;
            seenPerInstance.set(backup.beyondtrustInstanceId, rank);

            if (backup.creationDate.getTime() >= cutoff) {
                continue;
            }

            if (rank <= keepLatest) {
                keptAsLatest++;
                continue;
            }

            const file = await this.deleteFile(backup);

            if (file === 'failed') {
                failures++;
                continue;
            }

            if (file === 'missing') {
                missingFiles++;
            }

            await repository.delete({ id: backup.id });
            deleted++;
        }

        const report: BackupRetentionReport = { status: 'completed', deleted, missingFiles, keptAsLatest, failures };
        const line = `[retention] backups: deleted ${deleted} backups older than ${retentionDays} days (${missingFiles} files already missing), kept ${keptAsLatest} older backups as the newest of their instance, ${failures} files could not be deleted`;

        if (failures > 0) {
            this.logger.warn(line);
        } else {
            this.logger.log(line);
        }

        return report;
    }

    private async deleteFile(backup: BeyondtrustInstanceBackupEntity): Promise<'deleted' | 'missing' | 'failed'> {
        const root = path.resolve(this.appConfigService.storage.rootPath);
        const absolute = path.resolve(root, backup.backupFilePath.replace(/^[/\\]+/, ''));

        // Never delete outside the storage root, whatever the row says.
        if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
            this.logger.warn(`[retention] backups: backup ${backup.id} points outside the storage root, kept`);

            return 'failed';
        }

        try {
            await fs.promises.unlink(absolute);

            return 'deleted';
        } catch (error) {
            if ((error as { code?: string }).code === 'ENOENT') {
                return 'missing';
            }

            this.logger.warn(
                `[retention] backups: file of backup ${backup.id} could not be deleted (${
                    (error as { code?: string }).code ?? 'error'
                }), row kept`,
            );

            return 'failed';
        }
    }

    private static skipped(reason: string): BackupRetentionReport {
        return { status: 'skipped', deleted: 0, missingFiles: 0, keptAsLatest: 0, failures: 0, reason };
    }
}
