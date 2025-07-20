import { NotFoundException } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import * as fs from 'fs';
import * as path from 'path';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { BeyondtrustInstance } from '../../../beyondtrust-instance/models';
import { UrlUtility } from '../../../shared/utilities';
import { BeyondtrustInstanceBackupCreatedEvent } from '../../events';
import { BeyondtrustInstanceBackupEntity } from '../../repositories/entities';
import { BeyondtrustInstanceBackupRepositoryService } from '../../repositories/services/beyondtrust-instance-backup-repository.service';
import { CreateBeyondtrustInstanceBackupCommand } from '../create-beyondtrust-instance-backup.command';
import { CreateBeyondtrustInstanceBackupCommandHandler } from './create-beyondtrust-instance-backup.command-handler';

describe('CreateBeyondtrustInstanceBackupCommandHandler', () => {
    let appConfigService: AppConfigService;
    let commandBus: CommandBus;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let beyondtrustInstanceBackupRepositoryService: BeyondtrustInstanceBackupRepositoryService;
    let handler: CreateBeyondtrustInstanceBackupCommandHandler;

    beforeEach(() => {
        jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
            return undefined;
        });
        jest.spyOn(fs, 'writeFile').mockImplementation((_path, _data, callback) => {
            callback(null);
        });
        jest.spyOn(path, 'dirname').mockReturnValue('/mock/dir');
        jest.useFakeTimers().setSystemTime(new Date('2025-10-01T00:00:00Z'));
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        commandBus = mockCommandBus();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        beyondtrustInstanceBackupRepositoryService = mockBeyondtrustInstanceBackupRepositoryService();
        handler = new CreateBeyondtrustInstanceBackupCommandHandler(
            appConfigService,
            commandBus,
            queryBus,
            eventBus,
            beyondtrustInstanceBackupRepositoryService,
        );
    });

    describe('execute', () => {
        it('should throw NotFoundException if the beyondtrust instance is does not exist', async () => {
            // Arrange
            queryBus.execute = jest.fn().mockResolvedValue(null);

            // Act & Assert
            await expect(
                handler.execute(new CreateBeyondtrustInstanceBackupCommand('transaction-1', 123)),
            ).rejects.toThrow(NotFoundException);
        });

        it('should call the command bus, repository service, publish an event and return the result', async () => {
            // Arrange
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const beyondtrustInstanceBackupEntityToBeCreated = {
                beyondtrustInstanceId: 123,
                backupFilePath: '/backup/path/file.nsb',
            } as BeyondtrustInstanceBackupEntity;
            const beyondtrustInstanceBackupEntityCreateWithoutIdMethod = jest
                .spyOn(BeyondtrustInstanceBackupEntity, 'createWithoutId')
                .mockReturnValue(beyondtrustInstanceBackupEntityToBeCreated);
            const expectedResult = {
                id: 321,
                backupFilePath: '/backup/path/file.nsb',
            } as BeyondtrustInstanceBackupEntity;
            const beyondtrustInstanceBackupRepositoryServiceCreateMethod = jest
                .spyOn(beyondtrustInstanceBackupRepositoryService, 'create')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await handler.execute(new CreateBeyondtrustInstanceBackupCommand('transaction-1', 123));

            // Assert
            expect(beyondtrustInstanceBackupEntityCreateWithoutIdMethod).toHaveBeenCalledWith(
                123,
                `/backup/beyondtrust/transaction-1-${Date.now()}.nsb`,
            );
            expect(beyondtrustInstanceBackupRepositoryServiceCreateMethod).toHaveBeenCalledWith(
                beyondtrustInstanceBackupEntityToBeCreated,
            );
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<BeyondtrustInstanceBackupCreatedEvent>{
                    transactionId: 'transaction-1',
                    eventType: BeyondtrustInstanceBackupCreatedEvent.EVENT_TYPE,
                    payload: {
                        beyondtrustInstanceBackup: expectedResult,
                    },
                }),
            );
            expect(result).toBe(expectedResult);
        });
    });
});

function mockUrlUtility() {
    jest.spyOn(UrlUtility, 'join').mockImplementation((...args: string[]) => args.join('/'));
}

function mockAppConfigService() {
    return {
        storage: {
            rootPath: '/root/path',
            beyondTrustBackupPath: '/backup/beyondtrust',
        },
    } as AppConfigService;
}

function mockCommandBus() {
    const commandBus = {} as CommandBus;
    commandBus.execute = jest.fn();

    return commandBus;
}

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue({ id: 123 } as BeyondtrustInstance);

    return queryBus;
}

function mockEventBus() {
    const eventBus = {} as EventBus;
    eventBus.publish = jest.fn();

    return eventBus;
}

function mockBeyondtrustInstanceBackupRepositoryService() {
    const beyondtrustInstanceBackupRepositoryService = {} as BeyondtrustInstanceBackupRepositoryService;
    beyondtrustInstanceBackupRepositoryService.create = jest.fn();

    return beyondtrustInstanceBackupRepositoryService;
}
