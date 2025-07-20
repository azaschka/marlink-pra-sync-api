import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { BeyondtrustInstanceBackupRepositoryService } from '../../repositories/services/beyondtrust-instance-backup-repository.service';
import { RetrieveBeyondtrustInstanceBackupContentQuery } from '../retrieve-beyondtrust-instance-backup-content.query';
import { RetrieveBeyondtrustInstanceBackupContentQueryHandler } from './retrieve-beyondtrust-instance-backup-content.query-handler';

describe('RetrieveBeyondtrustInstanceBackupByIdQueryHandler', () => {
    let appConfigService: AppConfigService;
    let beyondtrustInstanceBackupRepositoryService: BeyondtrustInstanceBackupRepositoryService;
    let handler: RetrieveBeyondtrustInstanceBackupContentQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        beyondtrustInstanceBackupRepositoryService = mockBeyondtrustInstanceBackupRepositoryService();
        handler = new RetrieveBeyondtrustInstanceBackupContentQueryHandler(
            appConfigService,
            beyondtrustInstanceBackupRepositoryService,
        );
    });

    describe('execute', () => {
        it('should throw NotFoundException if the backup does not exist', async () => {
            // Arrange
            beyondtrustInstanceBackupRepositoryService.findBy = jest.fn().mockResolvedValue([]);

            // Act & Assert
            await expect(
                handler.execute(new RetrieveBeyondtrustInstanceBackupContentQuery('transaction-1', 123, 456)),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if the backup file does not exist', async () => {
            // Arrange
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);

            // Act & Assert
            await expect(
                handler.execute(new RetrieveBeyondtrustInstanceBackupContentQuery('transaction-1', 123, 456)),
            ).rejects.toThrow(NotFoundException);
        });

        it('should return as expected', async () => {
            // Arrange
            const expectedBuffer = Buffer.from('backup content');
            const expectedFilename = 'file.nsb';
            jest.spyOn(fs, 'existsSync').mockReturnValue(true);
            jest.spyOn(fs, 'readFile').mockImplementation((_path, callback) => {
                callback(null, expectedBuffer);
            });
            jest.spyOn(path, 'basename').mockReturnValue(expectedFilename);

            // Act
            const result = await handler.execute(
                new RetrieveBeyondtrustInstanceBackupContentQuery('transaction-1', 123, 456),
            );

            // Assert
            expect(result).toStrictEqual({
                filename: expectedFilename,
                buffer: expectedBuffer,
            });
        });
    });
});

function mockUrlUtility() {
    return {
        join: jest.fn((...args: string[]) => args.join('/')),
    };
}

function mockAppConfigService() {
    return {
        storage: {
            rootPath: '/root/path',
            beyondTrustBackupPath: '/beyondtrust/backup/path',
        },
    } as AppConfigService;
}

function mockBeyondtrustInstanceBackupRepositoryService() {
    const service = {} as BeyondtrustInstanceBackupRepositoryService;
    service.findOneBy = jest.fn().mockResolvedValue({
        backupFilePath: '/repo/file.nsb',
    });

    return service;
}
