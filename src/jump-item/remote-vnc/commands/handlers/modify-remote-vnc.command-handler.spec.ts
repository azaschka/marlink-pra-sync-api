import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ModifyRemoteVncCommand as BTModifyRemoteVncCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/commands';
import { RemoteVncModifiedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/dtos/outputs';
import { JumpGroupType as BTJumpGroupType } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpGroupType } from '../../enums';
import { RemoteVncModificationFailedEvent, RemoteVncModifiedEvent } from '../../events';
import { RemoteVncEntity } from '../../repositories/entities';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { ModifyRemoteVncCommand } from '../modify-remote-vnc.command';
import { ModifyRemoteVncCommandHandler } from './modify-remote-vnc.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTJumpGroupType: jest.fn().mockImplementation((type: BTJumpGroupType) => type),
    mapToBTJumpGroupType: jest.fn().mockImplementation((type: JumpGroupType) => type),
}));

abstract class TestHelper {
    public static get mockedRemoteVncModifiedDtoOutput(): RemoteVncModifiedDtoOutput {
        return {
            id: 1,
            name: 'remote-vnc-1',
            jumpointId: 2,
            hostname: 'hostname-1',
            port: 5900,
            jumpGroupId: 3,
            jumpGroupType: BTJumpGroupType.Personal,
            tag: 'tag-1',
            comments: 'comments-1',
            jumpPolicyId: 3,
            sessionPolicyId: 4,
        };
    }
}

describe('ModifyRemoteVncCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let remoteVncRepositoryService: RemoteVncRepositoryService;
    let handler: ModifyRemoteVncCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        remoteVncRepositoryService = mockRemoteVncRepositoryService();
        handler = new ModifyRemoteVncCommandHandler(commandBus, eventBus, remoteVncRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <ModifyRemoteVncCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
                name: 'remote-vnc-1',
                jumpointId: 1,
                hostname: 'hostname-1',
                port: 5900,
                jumpGroupId: 2,
                jumpGroupType: JumpGroupType.Personal,
                tag: 'tag-1',
                comments: 'comments-1',
                jumpPolicyId: 3,
                sessionPolicyId: 4,
            },
            <ModifyRemoteVncCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                name: 'remote-vnc-2',
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

                const remoteVncEntityToBeUpdated = { id: 123 } as RemoteVncEntity;
                const remoteVncEntityCreateMethod = jest
                    .spyOn(RemoteVncEntity, 'create')
                    .mockReturnValue(remoteVncEntityToBeUpdated);

                const expectedResult = { id: 321 } as RemoteVncEntity;
                const remoteVncRepositoryServiceCreateOrUpdateByIdMethod = jest
                    .spyOn(remoteVncRepositoryService, 'createOrUpdateById')
                    .mockResolvedValue(Promise.resolve());
                const remoteVncRepositoryServiceFindByIdMethod = jest
                    .spyOn(remoteVncRepositoryService, 'findOneById')
                    .mockResolvedValue(Promise.resolve(expectedResult));

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTModifyRemoteVncCommand(
                        command.transactionId,
                        command.tenantId,
                        command.id,
                        command.name,
                        command.jumpointId,
                        command.hostname,
                        command.port,
                        command.jumpGroupId,
                        command.jumpGroupType as unknown as BTJumpGroupType,
                        command.tag,
                        command.comments,
                        command.jumpPolicyId,
                        command.sessionPolicyId,
                    ),
                );
                expect(remoteVncEntityCreateMethod).toHaveBeenCalledWith(
                    TestHelper.mockedRemoteVncModifiedDtoOutput.id,
                    TestHelper.mockedRemoteVncModifiedDtoOutput.name,
                    TestHelper.mockedRemoteVncModifiedDtoOutput.jumpointId,
                    TestHelper.mockedRemoteVncModifiedDtoOutput.hostname,
                    TestHelper.mockedRemoteVncModifiedDtoOutput.port,
                    TestHelper.mockedRemoteVncModifiedDtoOutput.jumpGroupId,
                    TestHelper.mockedRemoteVncModifiedDtoOutput.jumpGroupType,
                    TestHelper.mockedRemoteVncModifiedDtoOutput.tag,
                    TestHelper.mockedRemoteVncModifiedDtoOutput.comments,
                    TestHelper.mockedRemoteVncModifiedDtoOutput.jumpPolicyId,
                    TestHelper.mockedRemoteVncModifiedDtoOutput.sessionPolicyId,
                );
                expect(remoteVncRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
                    123,
                    remoteVncEntityToBeUpdated,
                );
                expect(remoteVncRepositoryServiceFindByIdMethod).toHaveBeenCalledWith(
                    123,
                    remoteVncEntityToBeUpdated.id,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<RemoteVncModifiedEvent>{
                        transactionId: command.transactionId,
                        eventType: RemoteVncModifiedEvent.EVENT_TYPE,
                        payload: {
                            remoteVnc: result,
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
                handler.execute(<ModifyRemoteVncCommand>{
                    transactionId: 'transaction-1',
                    name: 'remote-vnc-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error if the retrieval from repository returns null', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const remoteVncEntityToBeCreated = { name: 'remote-vnc-1', id: 123 } as RemoteVncEntity;
            const remoteVncEntityCreateMethod = jest
                .spyOn(RemoteVncEntity, 'create')
                .mockReturnValue(remoteVncEntityToBeCreated);
            const remoteVncRepositoryServiceCreateOrUpdateByIdMethod = jest.spyOn(
                remoteVncRepositoryService,
                'createOrUpdateById',
            );
            const remoteVncRepositoryServiceFindByIdMethod = jest
                .spyOn(remoteVncRepositoryService, 'findOneById')
                .mockResolvedValue(null);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyRemoteVncCommand>{
                    transactionId: 'transaction-1',
                    name: 'remote-vnc-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow();
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(remoteVncEntityCreateMethod).toHaveBeenCalled();
            expect(remoteVncRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(remoteVncRepositoryServiceFindByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalled();
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: RemoteVncModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        remoteVnc: remoteVncEntityToBeCreated,
                        tenantId: 123,
                    },
                }),
            );
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const remoteVncEntityToBeCreated = { name: 'remote-vnc-1', id: 123 } as RemoteVncEntity;
            const remoteVncEntityCreateMethod = jest
                .spyOn(RemoteVncEntity, 'create')
                .mockReturnValue(remoteVncEntityToBeCreated);
            const expectedError = new Error('Error');
            const remoteVncRepositoryServiceCreateOrUpdateByIdMethod = jest
                .spyOn(remoteVncRepositoryService, 'createOrUpdateById')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyRemoteVncCommand>{
                    transactionId: 'transaction-1',
                    name: 'remote-vnc-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(remoteVncEntityCreateMethod).toHaveBeenCalled();
            expect(remoteVncRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: RemoteVncModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        remoteVnc: remoteVncEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedRemoteVncModifiedDtoOutput);

    return commandBus;
}

function mockRemoteVncRepositoryService() {
    const remoteVncRepositoryService = {} as RemoteVncRepositoryService;
    remoteVncRepositoryService.createOrUpdateById = jest.fn();
    remoteVncRepositoryService.findOneById = jest.fn();

    return remoteVncRepositoryService;
}
