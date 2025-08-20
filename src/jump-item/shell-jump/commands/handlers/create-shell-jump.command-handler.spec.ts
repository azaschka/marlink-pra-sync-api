import { ConflictException } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateShellJumpCommand as BTCreateShellJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/commands';
import { ShellJumpCreatedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/dtos/outputs';
import {
    JumpGroupType as BTJumpGroupType,
    ShellJumpProtocolType as BTShellJumpProtocolType,
    ShellJumpTerminalType as BTShellJumpTerminalType,
} from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpGroupType, ShellJumpProtocolType, ShellJumpTerminalType } from '../../enums';
import { ShellJumpCreatedEvent, ShellJumpCreationFailedEvent } from '../../events';
import { ShellJumpEntity } from '../../repositories/entities';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { CreateShellJumpCommand } from '../create-shell-jump.command';
import { CreateShellJumpCommandHandler } from './create-shell-jump.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTJumpGroupType: jest.fn().mockImplementation((type: BTJumpGroupType) => type),
    mapToBTJumpGroupType: jest.fn().mockImplementation((type: JumpGroupType) => type),
    mapFromBTShellJumpProtocolType: jest.fn().mockImplementation((type: BTShellJumpProtocolType) => type),
    mapToBTShellJumpProtocolType: jest.fn().mockImplementation((type: ShellJumpProtocolType) => type),
    mapFromBTShellJumpTerminalType: jest.fn().mockImplementation((type: BTShellJumpTerminalType) => type),
    mapToBTShellJumpTerminalType: jest.fn().mockImplementation((type: ShellJumpTerminalType) => type),
}));

abstract class TestHelper {
    public static get mockedShellJumpCreatedDtoOutput(): ShellJumpCreatedDtoOutput {
        return {
            id: 1,
            name: 'shell-jump-1',
            jumpointId: 2,
            hostname: 'hostname-1',
            protocol: BTShellJumpProtocolType.SSH,
            port: 22,
            jumpGroupId: 3,
            jumpGroupType: BTJumpGroupType.Personal,
            terminal: BTShellJumpTerminalType.VT100,
            keepAlive: 300,
            tag: 'tag-1',
            comments: 'comments-1',
            jumpPolicyId: 3,
            username: 'username-1',
            sessionPolicyId: 4,
        };
    }
}

describe('CreateShellJumpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let shellJumpRepositoryService: ShellJumpRepositoryService;
    let handler: CreateShellJumpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        shellJumpRepositoryService = mockShellJumpRepositoryService();
        handler = new CreateShellJumpCommandHandler(commandBus, eventBus, shellJumpRepositoryService);
    });

    describe('execute', () => {
        it('should throw a ConflictException if a Shell Jump with the same name, jump group id and tag already exists', async () => {
            // Arrange
            const command = <CreateShellJumpCommand>{
                transactionId: 'transaction-1',
                name: 'shell-jump-1',
                jumpointId: 2,
                protocolType: ShellJumpProtocolType.SSH,
                jumpGroupId: 3,
                tag: 'tag-1',
            };
            jest.spyOn(shellJumpRepositoryService, 'findOneBy').mockResolvedValue({ id: 123 } as ShellJumpEntity);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(ConflictException);
        });

        it.each([
            <CreateShellJumpCommand>{
                transactionId: 'transaction-1',
                name: 'shell-jump-1',
                jumpointId: 2,
                hostname: 'hostname-1',
                protocolType: ShellJumpProtocolType.SSH,
                port: 22,
                jumpGroupId: 3,
                jumpGroupType: JumpGroupType.Personal,
                terminalType: ShellJumpTerminalType.VT100,
                keepAliveIdleSessionInSeconds: 300,
                tag: 'tag-1',
                comments: 'comments-1',
                jumpPolicyId: 3,
                username: 'username-1',
                sessionPolicyId: 4,
            },
            <CreateShellJumpCommand>{
                transactionId: 'transaction-2',
                name: 'shell-jump-2',
                jumpointId: 2,
                hostname: 'hostname-2',
                jumpGroupId: 3,
                protocolType: ShellJumpProtocolType.TELNET,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const shellJumpEntityToBeCreated = { id: 123 } as ShellJumpEntity;
                const shellJumpEntityCreateMethod = jest
                    .spyOn(ShellJumpEntity, 'create')
                    .mockReturnValue(shellJumpEntityToBeCreated);

                const expectedResult = { id: 321 } as ShellJumpEntity;
                const shellJumpRepositoryServiceCreateMethod = jest
                    .spyOn(shellJumpRepositoryService, 'create')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTCreateShellJumpCommand(
                        command.transactionId,
                        command.name,
                        command.jumpointId,
                        command.hostname,
                        command.protocolType,
                        command.port,
                        command.jumpGroupId,
                        command.jumpGroupType,
                        command.terminalType as unknown as BTShellJumpTerminalType,
                        command.keepAliveIdleSessionInSeconds,
                        command.tag,
                        command.comments,
                        command.jumpPolicyId,
                        command.username,
                        command.sessionPolicyId,
                    ),
                );
                expect(shellJumpEntityCreateMethod).toHaveBeenCalledWith(
                    TestHelper.mockedShellJumpCreatedDtoOutput.id,
                    TestHelper.mockedShellJumpCreatedDtoOutput.name,
                    TestHelper.mockedShellJumpCreatedDtoOutput.jumpointId,
                    TestHelper.mockedShellJumpCreatedDtoOutput.hostname,
                    TestHelper.mockedShellJumpCreatedDtoOutput.protocol,
                    TestHelper.mockedShellJumpCreatedDtoOutput.port,
                    TestHelper.mockedShellJumpCreatedDtoOutput.jumpGroupId,
                    TestHelper.mockedShellJumpCreatedDtoOutput.jumpGroupType,
                    TestHelper.mockedShellJumpCreatedDtoOutput.terminal,
                    TestHelper.mockedShellJumpCreatedDtoOutput.keepAlive,
                    TestHelper.mockedShellJumpCreatedDtoOutput.tag,
                    TestHelper.mockedShellJumpCreatedDtoOutput.comments,
                    TestHelper.mockedShellJumpCreatedDtoOutput.jumpPolicyId,
                    TestHelper.mockedShellJumpCreatedDtoOutput.username,
                    TestHelper.mockedShellJumpCreatedDtoOutput.sessionPolicyId,
                );
                expect(shellJumpRepositoryServiceCreateMethod).toHaveBeenCalledWith(shellJumpEntityToBeCreated);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<ShellJumpCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: ShellJumpCreatedEvent.EVENT_TYPE,
                        payload: {
                            shellJump: result,
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
                handler.execute(<CreateShellJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'shell-jump-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const shellJumpEntityToBeCreated = { name: 'shell-jump-1', id: 123 } as ShellJumpEntity;
            const shellJumpEntityCreateMethod = jest
                .spyOn(ShellJumpEntity, 'create')
                .mockReturnValue(shellJumpEntityToBeCreated);
            const expectedError = new Error('Error');
            const shellJumpRepositoryServiceCreateMethod = jest
                .spyOn(shellJumpRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CreateShellJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'shell-jump-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(shellJumpEntityCreateMethod).toHaveBeenCalled();
            expect(shellJumpRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: ShellJumpCreationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        shellJump: shellJumpEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedShellJumpCreatedDtoOutput);

    return commandBus;
}

function mockShellJumpRepositoryService() {
    const shellJumpRepositoryService = {} as ShellJumpRepositoryService;
    shellJumpRepositoryService.create = jest.fn();
    shellJumpRepositoryService.findOneBy = jest.fn().mockResolvedValue(null);

    return shellJumpRepositoryService;
}
