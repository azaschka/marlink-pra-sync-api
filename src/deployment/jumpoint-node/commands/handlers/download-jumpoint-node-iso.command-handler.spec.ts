import { NotFoundException } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import * as fs from 'fs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { ErrorProcessorUtility, UrlUtility } from '../../../../shared/utilities';
import { JumpointNodeBusinessUnit, JumpointNodeServiceType } from '../../enums';
import { JumpointNodeIsoDownloadedEvent, JumpointNodeIsoDownloadFailedEvent } from '../../events';
import { JumpointNode } from '../../models';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { DownloadJumpointNodeIsoCommand } from '../download-jumpoint-node-iso.command';
import { DownloadJumpointNodeIsoCommandHandler } from './download-jumpoint-node-iso.command-handler';

describe('DownloadJumpointNodeIsoCommandHandler', () => {
    let appConfigService: AppConfigService;
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpointNodeRepositoryService: JumpointNodeRepositoryService;
    let handler: DownloadJumpointNodeIsoCommandHandler;

    beforeEach(() => {
        jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
            return undefined;
        });
        jest.spyOn(fs, 'writeFile').mockImplementation((_path, _data, callback) => {
            callback(null);
        });
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpointNodeRepositoryService = mockJumpointNodeRepositoryService();
        handler = new DownloadJumpointNodeIsoCommandHandler(
            appConfigService,
            commandBus,
            eventBus,
            jumpointNodeRepositoryService,
        );
    });

    describe('execute', () => {
        it('should throw NotFoundException if jumpoint node is not found', async () => {
            // Arrange
            jumpointNodeRepositoryService.findOneById = jest.fn().mockResolvedValue(null);

            // Act & Assert
            await expect(handler.execute(new DownloadJumpointNodeIsoCommand('transaction-1', 123))).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw the error and publish an event if there is an error in command bus execution', async () => {
            // Arrange
            const error = new Error('Command bus error');
            (commandBus.execute as jest.Mock).mockRejectedValue(error);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue(error.message);

            // Act & Assert
            await expect(handler.execute(new DownloadJumpointNodeIsoCommand('transaction-1', 123))).rejects.toThrow(
                error,
            );

            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<JumpointNodeIsoDownloadFailedEvent>{
                    transactionId: 'transaction-1',
                    eventType: JumpointNodeIsoDownloadFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: error.message,
                        id: 123,
                    },
                }),
            );
        });

        it('should call the command bus, repository service, publish an event and return the result', async () => {
            // Arrange
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const expectedResult = {
                certname: 'cert-1',
                businessUnit: JumpointNodeBusinessUnit.EG,
                id: 123,
                puppetServerDomain: 'puppet-server-domain-1',
                hasApproval: true,
                serviceType: JumpointNodeServiceType.Pra,
                isoFilePath: '/jumpoint/node/iso/cert-1.iso',
            } as JumpointNode;
            const jumpointNodeRepositoryServiceCreateMethod = jest.spyOn(
                jumpointNodeRepositoryService,
                'createOrUpdateById',
            );
            // Act
            const result = await handler.execute(new DownloadJumpointNodeIsoCommand('transaction-1', 123));

            // Assert
            expect(jumpointNodeRepositoryServiceCreateMethod).toHaveBeenCalledWith(expectedResult);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<JumpointNodeIsoDownloadedEvent>{
                    transactionId: 'transaction-1',
                    eventType: JumpointNodeIsoDownloadedEvent.EVENT_TYPE,
                    payload: {
                        jumpointNode: expectedResult,
                    },
                }),
            );
            expect(result).toStrictEqual(expectedResult);
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
            jumpointNodeIsoPath: '/jumpoint/node/iso',
        },
    } as AppConfigService;
}

function mockCommandBus() {
    const commandBus = {} as CommandBus;
    commandBus.execute = jest.fn();

    return commandBus;
}

function mockEventBus() {
    const eventBus = {} as EventBus;
    eventBus.publish = jest.fn();

    return eventBus;
}

function mockJumpointNodeRepositoryService() {
    const jumpointNodeRepositoryService = {} as JumpointNodeRepositoryService;
    jumpointNodeRepositoryService.findOneById = jest.fn().mockResolvedValue({
        certname: 'cert-1',
        businessUnit: JumpointNodeBusinessUnit.EG,
        id: 123,
        puppetServerDomain: 'puppet-server-domain-1',
        hasApproval: true,
        serviceType: JumpointNodeServiceType.Pra,
    });
    jumpointNodeRepositoryService.createOrUpdateById = jest.fn();

    return jumpointNodeRepositoryService;
}
