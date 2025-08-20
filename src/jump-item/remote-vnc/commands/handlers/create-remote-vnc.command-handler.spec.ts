import { ConflictException } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateRemoteVncCommand as BTCreateRemoteVncCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/commands';
import { RemoteVncCreatedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/dtos/outputs';
import { JumpGroupType as BTJumpGroupType } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpGroupType } from '../../enums';
import { RemoteVncCreatedEvent, RemoteVncCreationFailedEvent } from '../../events';
import { RemoteVncEntity } from '../../repositories/entities';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { CreateRemoteVncCommand } from '../create-remote-vnc.command';
import { CreateRemoteVncCommandHandler } from './create-remote-vnc.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTJumpGroupType: jest.fn().mockImplementation((type: BTJumpGroupType) => type),
    mapToBTJumpGroupType: jest.fn().mockImplementation((type: JumpGroupType) => type),
}));

abstract class TestHelper {
    public static get mockedRemoteVncCreatedDtoOutput(): RemoteVncCreatedDtoOutput {
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

describe('CreateRemoteVncCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let remoteVncRepositoryService: RemoteVncRepositoryService;
    let handler: CreateRemoteVncCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        remoteVncRepositoryService = mockRemoteVncRepositoryService();
        handler = new CreateRemoteVncCommandHandler(commandBus, eventBus, remoteVncRepositoryService);
    });

    describe('execute', () => {
        it('should throw ConflictException if Remote VNC with same name, jump group id and tag already exists', async () => {
            // Arrange
            const command = <CreateRemoteVncCommand>{
                transactionId: 'transaction-1',
                name: 'remote-vnc-1',
                jumpointId: 1,
                jumpGroupId: 2,
                jumpGroupType: JumpGroupType.Personal,
                tag: 'tag-1',
            };
            jest.spyOn(remoteVncRepositoryService, 'findOneBy').mockResolvedValue({ id: 123 } as RemoteVncEntity);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(ConflictException);
        });

        it.each([
            <CreateRemoteVncCommand>{
                transactionId: 'transaction-1',
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
            <CreateRemoteVncCommand>{
                transactionId: 'transaction-2',
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

                const remoteVncEntityToBeCreated = { id: 123 } as RemoteVncEntity;
                const remoteVncEntityCreateMethod = jest
                    .spyOn(RemoteVncEntity, 'create')
                    .mockReturnValue(remoteVncEntityToBeCreated);

                const expectedResult = { id: 321 } as RemoteVncEntity;
                const remoteVncRepositoryServiceCreateMethod = jest
                    .spyOn(remoteVncRepositoryService, 'create')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTCreateRemoteVncCommand(
                        command.transactionId,
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
                    TestHelper.mockedRemoteVncCreatedDtoOutput.id,
                    TestHelper.mockedRemoteVncCreatedDtoOutput.name,
                    TestHelper.mockedRemoteVncCreatedDtoOutput.jumpointId,
                    TestHelper.mockedRemoteVncCreatedDtoOutput.hostname,
                    TestHelper.mockedRemoteVncCreatedDtoOutput.port,
                    TestHelper.mockedRemoteVncCreatedDtoOutput.jumpGroupId,
                    TestHelper.mockedRemoteVncCreatedDtoOutput.jumpGroupType,
                    TestHelper.mockedRemoteVncCreatedDtoOutput.tag,
                    TestHelper.mockedRemoteVncCreatedDtoOutput.comments,
                    TestHelper.mockedRemoteVncCreatedDtoOutput.jumpPolicyId,
                    TestHelper.mockedRemoteVncCreatedDtoOutput.sessionPolicyId,
                );
                expect(remoteVncRepositoryServiceCreateMethod).toHaveBeenCalledWith(remoteVncEntityToBeCreated);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<RemoteVncCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: RemoteVncCreatedEvent.EVENT_TYPE,
                        payload: {
                            remoteVnc: result,
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
                handler.execute(<CreateRemoteVncCommand>{
                    transactionId: 'transaction-1',
                    name: 'remote-vnc-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const remoteVncEntityToBeCreated = { name: 'remote-vnc-1', id: 123 } as RemoteVncEntity;
            const remoteVncEntityCreateMethod = jest
                .spyOn(RemoteVncEntity, 'create')
                .mockReturnValue(remoteVncEntityToBeCreated);
            const expectedError = new Error('Error');
            const remoteVncRepositoryServiceCreateMethod = jest
                .spyOn(remoteVncRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CreateRemoteVncCommand>{
                    transactionId: 'transaction-1',
                    name: 'remote-vnc-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(remoteVncEntityCreateMethod).toHaveBeenCalled();
            expect(remoteVncRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: RemoteVncCreationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        remoteVnc: remoteVncEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedRemoteVncCreatedDtoOutput);

    return commandBus;
}

function mockRemoteVncRepositoryService() {
    const remoteVncRepositoryService = {} as RemoteVncRepositoryService;
    remoteVncRepositoryService.create = jest.fn();
    remoteVncRepositoryService.findOneBy = jest.fn().mockResolvedValue(null);

    return remoteVncRepositoryService;
}
