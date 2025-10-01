import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ModifyShellJumpCommand as BTModifyShellJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/commands';
import { ShellJumpModifiedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/dtos/outputs';
import {
    JumpGroupType as BTJumpGroupType,
    ShellJumpProtocolType as BTShellJumpProtocolType,
    ShellJumpTerminalType as BTShellJumpTerminalType,
} from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpGroupType, ShellJumpProtocolType, ShellJumpTerminalType } from '../../enums';
import { ShellJumpModificationFailedEvent, ShellJumpModifiedEvent } from '../../events';
import { ShellJumpEntity } from '../../repositories/entities';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { ModifyShellJumpCommand } from '../modify-shell-jump.command';
import { ModifyShellJumpCommandHandler } from './modify-shell-jump.command-handler';

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
    public static get mockedShellJumpModifiedDtoOutput(): ShellJumpModifiedDtoOutput {
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

describe('ModifyShellJumpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let shellJumpRepositoryService: ShellJumpRepositoryService;
    let handler: ModifyShellJumpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        shellJumpRepositoryService = mockShellJumpRepositoryService();
        handler = new ModifyShellJumpCommandHandler(commandBus, eventBus, shellJumpRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <ModifyShellJumpCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
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
            <ModifyShellJumpCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                name: 'shell-jump-2',
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

                const shellJumpEntityToBeUpdated = { id: 123 } as ShellJumpEntity;
                const shellJumpEntityCreateMethod = jest
                    .spyOn(ShellJumpEntity, 'create')
                    .mockReturnValue(shellJumpEntityToBeUpdated);

                const expectedResult = { id: 321 } as ShellJumpEntity;
                const shellJumpRepositoryServiceCreateOrUpdateByIdMethod = jest
                    .spyOn(shellJumpRepositoryService, 'createOrUpdateById')
                    .mockResolvedValue(Promise.resolve());
                const shellJumpRepositoryServiceFindByIdMethod = jest
                    .spyOn(shellJumpRepositoryService, 'findOneById')
                    .mockResolvedValue(Promise.resolve(expectedResult));

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTModifyShellJumpCommand(
                        command.transactionId,
                        command.tenantId,
                        command.id,
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
                    TestHelper.mockedShellJumpModifiedDtoOutput.id,
                    TestHelper.mockedShellJumpModifiedDtoOutput.name,
                    TestHelper.mockedShellJumpModifiedDtoOutput.jumpointId,
                    TestHelper.mockedShellJumpModifiedDtoOutput.hostname,
                    TestHelper.mockedShellJumpModifiedDtoOutput.protocol,
                    TestHelper.mockedShellJumpModifiedDtoOutput.port,
                    TestHelper.mockedShellJumpModifiedDtoOutput.jumpGroupId,
                    TestHelper.mockedShellJumpModifiedDtoOutput.jumpGroupType,
                    TestHelper.mockedShellJumpModifiedDtoOutput.terminal,
                    TestHelper.mockedShellJumpModifiedDtoOutput.keepAlive,
                    TestHelper.mockedShellJumpModifiedDtoOutput.tag,
                    TestHelper.mockedShellJumpModifiedDtoOutput.comments,
                    TestHelper.mockedShellJumpModifiedDtoOutput.jumpPolicyId,
                    TestHelper.mockedShellJumpModifiedDtoOutput.username,
                    TestHelper.mockedShellJumpModifiedDtoOutput.sessionPolicyId,
                );
                expect(shellJumpRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
                    123,
                    shellJumpEntityToBeUpdated,
                );
                expect(shellJumpRepositoryServiceFindByIdMethod).toHaveBeenCalledWith(
                    123,
                    shellJumpEntityToBeUpdated.id,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<ShellJumpModifiedEvent>{
                        transactionId: command.transactionId,
                        eventType: ShellJumpModifiedEvent.EVENT_TYPE,
                        payload: {
                            shellJump: result,
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
                handler.execute(<ModifyShellJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'shell-jump-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error if the retrieval from repository returns null', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const shellJumpEntityToBeCreated = { name: 'shell-jump-1', id: 123 } as ShellJumpEntity;
            const shellJumpEntityCreateMethod = jest
                .spyOn(ShellJumpEntity, 'create')
                .mockReturnValue(shellJumpEntityToBeCreated);
            const shellJumpRepositoryServiceCreateOrUpdateByIdMethod = jest.spyOn(
                shellJumpRepositoryService,
                'createOrUpdateById',
            );
            const shellJumpRepositoryServiceFindByIdMethod = jest
                .spyOn(shellJumpRepositoryService, 'findOneById')
                .mockResolvedValue(null);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyShellJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'shell-jump-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow();
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(shellJumpEntityCreateMethod).toHaveBeenCalled();
            expect(shellJumpRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(shellJumpRepositoryServiceFindByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalled();
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: ShellJumpModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        shellJump: shellJumpEntityToBeCreated,
                        tenantId: 123,
                    },
                }),
            );
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const shellJumpEntityToBeCreated = { name: 'shell-jump-1', id: 123 } as ShellJumpEntity;
            const shellJumpEntityCreateMethod = jest
                .spyOn(ShellJumpEntity, 'create')
                .mockReturnValue(shellJumpEntityToBeCreated);
            const expectedError = new Error('Error');
            const shellJumpRepositoryServiceCreateOrUpdateByIdMethod = jest
                .spyOn(shellJumpRepositoryService, 'createOrUpdateById')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyShellJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'shell-jump-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(shellJumpEntityCreateMethod).toHaveBeenCalled();
            expect(shellJumpRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: ShellJumpModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        shellJump: shellJumpEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedShellJumpModifiedDtoOutput);

    return commandBus;
}

function mockShellJumpRepositoryService() {
    const shellJumpRepositoryService = {} as ShellJumpRepositoryService;
    shellJumpRepositoryService.createOrUpdateById = jest.fn();
    shellJumpRepositoryService.findOneById = jest.fn();

    return shellJumpRepositoryService;
}
