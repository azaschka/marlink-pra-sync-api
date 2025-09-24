import { ConflictException } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateRemoteRdpCommand as BTCreateRemoteRdpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/commands';
import { RemoteRdpCreatedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/dtos/outputs';
import {
    JumpGroupType as BTJumpGroupType,
    RdpQualityMode as BTRdpQualityMode,
    SecureAppType as BTSecureAppType,
} from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpGroupType, RdpQualityMode, SecureAppType } from '../../enums';
import { RemoteRdpCreatedEvent, RemoteRdpCreationFailedEvent } from '../../events';
import { RemoteRdpEntity } from '../../repositories/entities';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';
import { CreateRemoteRdpCommand } from '../create-remote-rdp.command';
import { CreateRemoteRdpCommandHandler } from './create-remote-rdp.command-handler';

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
    public static get mockedRemoteRdpCreatedDtoOutput(): RemoteRdpCreatedDtoOutput {
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

describe('CreateRemoteRdpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let remoteRdpRepositoryService: RemoteRdpRepositoryService;
    let handler: CreateRemoteRdpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        remoteRdpRepositoryService = mockRemoteRdpRepositoryService();
        handler = new CreateRemoteRdpCommandHandler(commandBus, eventBus, remoteRdpRepositoryService);
    });

    describe('execute', () => {
        it('should throw ConflictException if a Remote RDP with the same name, jump group id and tag already exists', async () => {
            // Arrange
            const command = <CreateRemoteRdpCommand>{
                transactionId: 'transaction-1',
                name: 'remote-rdp-1',
                jumpointId: 1,
                hostname: 'hostname-1',
                jumpGroupId: 2,
                tag: 'tag-1',
            };
            jest.spyOn(remoteRdpRepositoryService, 'findOneBy').mockResolvedValue({ id: 123 } as RemoteRdpEntity);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(ConflictException);
        });

        it.each([
            <CreateRemoteRdpCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
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
            <CreateRemoteRdpCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
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

                const remoteRdpEntityToBeCreated = { id: 123 } as RemoteRdpEntity;
                const remoteRdpEntityCreateMethod = jest
                    .spyOn(RemoteRdpEntity, 'create')
                    .mockReturnValue(remoteRdpEntityToBeCreated);

                const expectedResult = { id: 321 } as RemoteRdpEntity;
                const remoteRdpRepositoryServiceCreateMethod = jest
                    .spyOn(remoteRdpRepositoryService, 'create')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTCreateRemoteRdpCommand(
                        command.transactionId,
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
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.id,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.name,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.jumpointId,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.hostname,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.jumpGroupId,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.jumpGroupType,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.quality,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.console,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.ignoreUntrusted,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.tag,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.comments,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.rdpUsername,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.domain,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.jumpPolicyId,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.sessionForensics,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.sessionPolicyId,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.endpointId,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.secureAppType,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.remoteAppName,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.remoteAppParams,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.remoteExePath,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.remoteExeParams,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.targetSystem,
                    TestHelper.mockedRemoteRdpCreatedDtoOutput.credentialType,
                );
                expect(remoteRdpRepositoryServiceCreateMethod).toHaveBeenCalledWith(123, remoteRdpEntityToBeCreated);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<RemoteRdpCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: RemoteRdpCreatedEvent.EVENT_TYPE,
                        payload: {
                            remoteRdp: result,
                            tenantId: 123,
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
                handler.execute(<CreateRemoteRdpCommand>{
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
                handler.execute(<CreateRemoteRdpCommand>{
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
                    eventType: RemoteRdpCreationFailedEvent.EVENT_TYPE,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedRemoteRdpCreatedDtoOutput);

    return commandBus;
}

function mockRemoteRdpRepositoryService() {
    const remoteRdpRepositoryService = {} as RemoteRdpRepositoryService;
    remoteRdpRepositoryService.create = jest.fn();
    remoteRdpRepositoryService.findOneBy = jest.fn().mockResolvedValue(null);

    return remoteRdpRepositoryService;
}
