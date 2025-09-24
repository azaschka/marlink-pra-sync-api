import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { CopyRemoteRdpCommand as BTCopyRemoteRdpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/commands';
import {
    RemoteRdpCopiedDtoOutput,
    RemoteRdpRetrievedDtoOutput,
} from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/dtos/outputs';
import {
    JumpGroupType as BTJumpGroupType,
    RdpQualityMode as BTRdpQualityMode,
    SecureAppType as BTSecureAppType,
} from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpGroupType, RdpQualityMode, SecureAppType } from '../../enums';
import { RemoteRdpCopiedEvent, RemoteRdpCopyFailedEvent } from '../../events';
import { RemoteRdpEntity } from '../../repositories/entities';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';
import { CopyRemoteRdpCommand } from '../copy-remote-rdp.command';
import { CopyRemoteRdpCommandHandler } from './copy-remote-rdp.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTJumpGroupType: jest.fn().mockImplementation((type: BTJumpGroupType) => type),
    mapToBTJumpGroupType: jest.fn().mockImplementation((type: JumpGroupType) => type),
    mapFromBTRdpQualityMode: jest.fn().mockImplementation((type: BTRdpQualityMode) => type),
    mapToBTRdpQualityMode: jest.fn().mockImplementation((type: RdpQualityMode) => type),
    mapFromBTSecureAppType: jest.fn().mockImplementation((type: BTSecureAppType) => type),
    mapToBTSecureAppType: jest.fn().mockImplementation((type: SecureAppType) => type),
}));

abstract class TestHelper {
    public static get mockedRemoteRdpCopiedDtoOutput(): RemoteRdpCopiedDtoOutput {
        return {
            action: 'copy',
            success: 'success',
            destId: 1,
        };
    }

    public static get mockedRemoteRdpRetrievedDtoOutput(): RemoteRdpRetrievedDtoOutput {
        return {
            id: 1,
            name: 'remote-rdp-1',
            jumpointId: 2,
            hostname: 'hostname-1',
            jumpGroupId: 3,
            jumpGroupType: BTJumpGroupType.Personal,
            quality: BTRdpQualityMode.PerformanceQuality,
            console: true,
            ignoreUntrusted: false,
            tag: 'tag-1',
            comments: 'comments-1',
            rdpUsername: 'rdp-username-1',
            domain: 'domain-1',
            jumpPolicyId: 3,
            sessionForensics: true,
            sessionPolicyId: 4,
            endpointId: 5,
            secureAppType: BTSecureAppType.RemoteApp,
            remoteAppName: 'remote-app-name-1',
            remoteAppParams: 'remote-app-params-1',
            remoteExePath: 'remote-exe-path-1',
            remoteExeParams: 'remote-exe-params-1',
            targetSystem: 'target-system-1',
            credentialType: 'credential-type-1',
        };
    }
}

describe('CopyRemoteRdpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let queryBus: QueryBus;
    let remoteRdpRepositoryService: RemoteRdpRepositoryService;
    let handler: CopyRemoteRdpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        queryBus = mockQueryBus();
        remoteRdpRepositoryService = mockRemoteRdpRepositoryService();
        handler = new CopyRemoteRdpCommandHandler(commandBus, eventBus, queryBus, remoteRdpRepositoryService);
    });

    describe('execute', () => {
        it('should call the command bus and repository service with correct parameters, publish an event and return the result', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

            const remoteRdpEntityToBeCreated = { id: 123 } as RemoteRdpEntity;
            const remoteRdpEntityCreateMethod = jest
                .spyOn(RemoteRdpEntity, 'create')
                .mockReturnValue(remoteRdpEntityToBeCreated);

            const expectedResult = { id: 321 } as RemoteRdpEntity;
            const remoteRdpRepositoryServiceCreateMethod = jest
                .spyOn(remoteRdpRepositoryService, 'create')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await handler.execute(<CopyRemoteRdpCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
                jumpGroupId: 3,
                jumpGroupType: JumpGroupType.Personal,
                name: 'remote-rdp-1',
            });

            // Assert
            expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                new BTCopyRemoteRdpCommand('transaction-1', 1, 3, JumpGroupType.Personal, 'remote-rdp-1'),
            );
            expect(remoteRdpEntityCreateMethod).toHaveBeenCalledWith(
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.id,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.name,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.jumpointId,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.hostname,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.jumpGroupId,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.jumpGroupType,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.quality,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.console,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.ignoreUntrusted,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.tag,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.comments,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.rdpUsername,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.domain,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.jumpPolicyId,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.sessionForensics,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.sessionPolicyId,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.endpointId,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.secureAppType,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.remoteAppName,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.remoteAppParams,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.remoteExePath,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.remoteExeParams,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.targetSystem,
                TestHelper.mockedRemoteRdpRetrievedDtoOutput.credentialType,
            );
            expect(remoteRdpRepositoryServiceCreateMethod).toHaveBeenCalledWith(123, remoteRdpEntityToBeCreated);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<RemoteRdpCopiedEvent>{
                    transactionId: 'transaction-1',
                    eventType: RemoteRdpCopiedEvent.EVENT_TYPE,
                    payload: {
                        remoteRdp: result,
                        tenantId: 123,
                    },
                }),
            );
            expect(result).toBe(expectedResult);
        });

        it('should throw an error if the command bus fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<CopyRemoteRdpCommand>{
                    transactionId: 'transaction-1',
                    name: 'remote-rdp-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const remoteRdpEntityToBeCreated = { name: 'remote-rdp-1', id: 123 } as RemoteRdpEntity;
            const remoteRdpEntityCreateMethod = jest
                .spyOn(RemoteRdpEntity, 'create')
                .mockReturnValue(remoteRdpEntityToBeCreated);
            const expectedError = new Error('Error');
            const remoteRdpRepositoryServiceCreateMethod = jest
                .spyOn(remoteRdpRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CopyRemoteRdpCommand>{
                    transactionId: 'transaction-1',
                    name: 'remote-rdp-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(remoteRdpEntityCreateMethod).toHaveBeenCalled();
            expect(remoteRdpRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: RemoteRdpCopyFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        remoteRdp: remoteRdpEntityToBeCreated,
                        tenantId: 123,
                    },
                }),
            );
        });
    });
});

function mockEventBus() {
    const eventBus = {} as EventBus;
    eventBus.publish = jest.fn();

    return eventBus;
}

function mockCommandBus() {
    const commandBus = {} as CommandBus;
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedRemoteRdpCopiedDtoOutput);

    return commandBus;
}

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedRemoteRdpRetrievedDtoOutput);

    return queryBus;
}

function mockRemoteRdpRepositoryService() {
    const remoteRdpRepositoryService = {} as RemoteRdpRepositoryService;
    remoteRdpRepositoryService.create = jest.fn();

    return remoteRdpRepositoryService;
}
