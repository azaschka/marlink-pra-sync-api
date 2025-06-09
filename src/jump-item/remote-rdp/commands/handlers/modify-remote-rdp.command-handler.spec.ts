import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ModifyRemoteRdpCommand as BTModifyRemoteRdpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/commands';
import { RemoteRdpModifiedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/dtos/outputs';
import {
    JumpGroupType as BTJumpGroupType,
    RdpQualityMode as BTRdpQualityMode,
    SecureAppType as BTSecureAppType,
} from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpGroupType, RdpQualityMode, SecureAppType } from '../../enums';
import { RemoteRdpModificationFailedEvent, RemoteRdpModifiedEvent } from '../../events';
import { RemoteRdpEntity } from '../../repositories/entities';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';
import { ModifyRemoteRdpCommand } from '../modify-remote-rdp.command';
import { ModifyRemoteRdpCommandHandler } from './modify-remote-rdp.command-handler';

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
    public static get mockedRemoteRdpModifiedDtoOutput(): RemoteRdpModifiedDtoOutput {
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

describe('ModifyRemoteRdpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let remoteRdpRepositoryService: RemoteRdpRepositoryService;
    let handler: ModifyRemoteRdpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        remoteRdpRepositoryService = mockRemoteRdpRepositoryService();
        handler = new ModifyRemoteRdpCommandHandler(commandBus, eventBus, remoteRdpRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <ModifyRemoteRdpCommand>{
                transactionId: 'transaction-1',
                id: 1,
                name: 'remote-rdp-1',
                jumpointId: 1,
                hostname: 'hostname-1',
                jumpGroupId: 2,
                jumpGroupType: JumpGroupType.Personal,
                qualityMode: RdpQualityMode.PerformanceQuality,
                mustStartNewConsoleSession: true,
                mustIgnoreUntrustedServerCert: false,
                tag: 'tag-1',
                comments: 'comments-1',
                rdpUsername: 'rdp-username-1',
                domain: 'domain-1',
                jumpPolicyId: 3,
                isSessionForensicsEnabled: true,
                sessionPolicyId: 4,
                secureAppType: SecureAppType.RemoteApp,
                remoteAppName: 'remote-app-name-1',
                remoteAppParams: 'remote-app-params-1',
                remoteExePath: 'remote-exe-path-1',
                remoteExeParams: 'remote-exe-params-1',
                targetSystem: 'target-system-1',
                credentialType: 'credential-type-1',
            },
            <ModifyRemoteRdpCommand>{
                transactionId: 'transaction-2',
                name: 'remote-rdp-2',
                jumpointId: 2,
                hostname: 'hostname-2',
                jumpGroupId: 3,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const remoteRdpEntityToBeUpdated = { id: 123 } as RemoteRdpEntity;
                const remoteRdpEntityCreateMethod = jest
                    .spyOn(RemoteRdpEntity, 'create')
                    .mockReturnValue(remoteRdpEntityToBeUpdated);

                const expectedResult = { id: 321 } as RemoteRdpEntity;
                const remoteRdpRepositoryServiceCreateOrUpdateByIdMethod = jest
                    .spyOn(remoteRdpRepositoryService, 'createOrUpdateById')
                    .mockResolvedValue(Promise.resolve());
                const remoteRdpRepositoryServiceFindByIdMethod = jest
                    .spyOn(remoteRdpRepositoryService, 'findOneById')
                    .mockResolvedValue(Promise.resolve(expectedResult));

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTModifyRemoteRdpCommand(
                        command.transactionId,
                        command.id,
                        command.name,
                        command.jumpointId,
                        command.hostname,
                        command.jumpGroupId,
                        command.jumpGroupType as unknown as BTJumpGroupType,
                        command.qualityMode as unknown as BTRdpQualityMode,
                        command.mustStartNewConsoleSession,
                        command.mustIgnoreUntrustedServerCert,
                        command.tag,
                        command.comments,
                        command.rdpUsername,
                        command.domain,
                        command.jumpPolicyId,
                        command.isSessionForensicsEnabled,
                        command.sessionPolicyId,
                        command.secureAppType as unknown as BTSecureAppType,
                        command.remoteAppName,
                        command.remoteAppParams,
                        command.remoteExePath,
                        command.remoteExeParams,
                        command.targetSystem,
                        command.credentialType,
                    ),
                );
                expect(remoteRdpEntityCreateMethod).toHaveBeenCalledWith(
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.id,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.name,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.jumpointId,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.hostname,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.jumpGroupId,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.jumpGroupType,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.quality,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.console,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.ignoreUntrusted,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.tag,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.comments,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.rdpUsername,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.domain,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.jumpPolicyId,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.sessionForensics,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.sessionPolicyId,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.endpointId,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.secureAppType,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.remoteAppName,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.remoteAppParams,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.remoteExePath,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.remoteExeParams,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.targetSystem,
                    TestHelper.mockedRemoteRdpModifiedDtoOutput.credentialType,
                );
                expect(remoteRdpRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
                    remoteRdpEntityToBeUpdated,
                );
                expect(remoteRdpRepositoryServiceFindByIdMethod).toHaveBeenCalledWith(remoteRdpEntityToBeUpdated.id);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<RemoteRdpModifiedEvent>{
                        transactionId: command.transactionId,
                        eventType: RemoteRdpModifiedEvent.EVENT_TYPE,
                        payload: {
                            remoteRdp: result,
                        },
                    }),
                );
                expect(result).toBe(expectedResult);
            },
        );

        it('should throw an error if the command bus fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<ModifyRemoteRdpCommand>{
                    transactionId: 'transaction-1',
                    name: 'remote-rdp-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error if the retrieval from repository returns null', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const remoteRdpEntityToBeCreated = { name: 'remote-rdp-1', id: 123 } as RemoteRdpEntity;
            const remoteRdpEntityCreateMethod = jest
                .spyOn(RemoteRdpEntity, 'create')
                .mockReturnValue(remoteRdpEntityToBeCreated);
            const remoteRdpRepositoryServiceCreateOrUpdateByIdMethod = jest.spyOn(
                remoteRdpRepositoryService,
                'createOrUpdateById',
            );
            const remoteRdpRepositoryServiceFindByIdMethod = jest
                .spyOn(remoteRdpRepositoryService, 'findOneById')
                .mockResolvedValue(null);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyRemoteRdpCommand>{
                    transactionId: 'transaction-1',
                    name: 'remote-rdp-1',
                }),
            ).rejects.toThrow();
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(remoteRdpEntityCreateMethod).toHaveBeenCalled();
            expect(remoteRdpRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(remoteRdpRepositoryServiceFindByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalled();
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: RemoteRdpModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        remoteRdp: remoteRdpEntityToBeCreated,
                    },
                }),
            );
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const remoteRdpEntityToBeCreated = { name: 'remote-rdp-1', id: 123 } as RemoteRdpEntity;
            const remoteRdpEntityCreateMethod = jest
                .spyOn(RemoteRdpEntity, 'create')
                .mockReturnValue(remoteRdpEntityToBeCreated);
            const expectedError = new Error('Error');
            const remoteRdpRepositoryServiceCreateOrUpdateByIdMethod = jest
                .spyOn(remoteRdpRepositoryService, 'createOrUpdateById')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyRemoteRdpCommand>{
                    transactionId: 'transaction-1',
                    name: 'remote-rdp-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(remoteRdpEntityCreateMethod).toHaveBeenCalled();
            expect(remoteRdpRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: RemoteRdpModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        remoteRdp: remoteRdpEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedRemoteRdpModifiedDtoOutput);

    return commandBus;
}

function mockRemoteRdpRepositoryService() {
    const remoteRdpRepositoryService = {} as RemoteRdpRepositoryService;
    remoteRdpRepositoryService.createOrUpdateById = jest.fn();
    remoteRdpRepositoryService.findOneById = jest.fn();

    return remoteRdpRepositoryService;
}
