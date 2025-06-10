import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { CopyShellJumpCommand as BTCopyShellJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/commands';
import {
    ShellJumpCopiedDtoOutput,
    ShellJumpRetrievedDtoOutput,
} from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/dtos/outputs';
import {
    JumpGroupType as BTJumpGroupType,
    ShellJumpProtocolType as BTShellJumpProtocolType,
    ShellJumpTerminalType as BTShellJumpTerminalType,
} from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpGroupType, ShellJumpProtocolType, ShellJumpTerminalType } from '../../enums';
import { ShellJumpCopiedEvent, ShellJumpCopyFailedEvent } from '../../events';
import { ShellJumpEntity } from '../../repositories/entities';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { CopyShellJumpCommand } from '../copy-shell-jump.command';
import { CopyShellJumpCommandHandler } from './copy-shell-jump.command-handler';

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
    public static get mockedShellJumpCopiedDtoOutput(): ShellJumpCopiedDtoOutput {
        return {
            action: 'copy',
            success: 'success',
            destId: 1,
        };
    }

    public static get mockedShellJumpRetrievedDtoOutput(): ShellJumpRetrievedDtoOutput {
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

describe('CopyShellJumpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let queryBus: QueryBus;
    let shellJumpRepositoryService: ShellJumpRepositoryService;
    let handler: CopyShellJumpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        queryBus = mockQueryBus();
        shellJumpRepositoryService = mockShellJumpRepositoryService();
        handler = new CopyShellJumpCommandHandler(commandBus, eventBus, queryBus, shellJumpRepositoryService);
    });

    describe('execute', () => {
        it('should call the command bus and repository service with correct parameters, publish an event and return the result', async () => {
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
            const result = await handler.execute(<CopyShellJumpCommand>{
                transactionId: 'transaction-1',
                id: 1,
                jumpGroupId: 3,
                jumpGroupType: JumpGroupType.Personal,
                name: 'shell-jump-1',
            });

            // Assert
            expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                new BTCopyShellJumpCommand('transaction-1', 1, 3, JumpGroupType.Personal, 'shell-jump-1'),
            );
            expect(shellJumpEntityCreateMethod).toHaveBeenCalledWith(
                TestHelper.mockedShellJumpRetrievedDtoOutput.id,
                TestHelper.mockedShellJumpRetrievedDtoOutput.name,
                TestHelper.mockedShellJumpRetrievedDtoOutput.jumpointId,
                TestHelper.mockedShellJumpRetrievedDtoOutput.hostname,
                TestHelper.mockedShellJumpRetrievedDtoOutput.protocol,
                TestHelper.mockedShellJumpRetrievedDtoOutput.port,
                TestHelper.mockedShellJumpRetrievedDtoOutput.jumpGroupId,
                TestHelper.mockedShellJumpRetrievedDtoOutput.jumpGroupType,
                TestHelper.mockedShellJumpRetrievedDtoOutput.terminal,
                TestHelper.mockedShellJumpRetrievedDtoOutput.keepAlive,
                TestHelper.mockedShellJumpRetrievedDtoOutput.tag,
                TestHelper.mockedShellJumpRetrievedDtoOutput.comments,
                TestHelper.mockedShellJumpRetrievedDtoOutput.jumpPolicyId,
                TestHelper.mockedShellJumpRetrievedDtoOutput.username,
                TestHelper.mockedShellJumpRetrievedDtoOutput.sessionPolicyId,
            );
            expect(shellJumpRepositoryServiceCreateMethod).toHaveBeenCalledWith(shellJumpEntityToBeCreated);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<ShellJumpCopiedEvent>{
                    transactionId: 'transaction-1',
                    eventType: ShellJumpCopiedEvent.EVENT_TYPE,
                    payload: {
                        shellJump: result,
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
                handler.execute(<CopyShellJumpCommand>{
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
                handler.execute(<CopyShellJumpCommand>{
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
                    eventType: ShellJumpCopyFailedEvent.EVENT_TYPE,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedShellJumpCopiedDtoOutput);

    return commandBus;
}

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedShellJumpRetrievedDtoOutput);

    return queryBus;
}

function mockShellJumpRepositoryService() {
    const shellJumpRepositoryService = {} as ShellJumpRepositoryService;
    shellJumpRepositoryService.create = jest.fn();

    return shellJumpRepositoryService;
}
