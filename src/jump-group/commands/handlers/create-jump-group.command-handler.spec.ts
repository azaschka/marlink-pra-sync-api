import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateJumpGroupCommand as BTCreateJumpGroupCommand } from '../../../beyondtrust-pra-conf-api/jump-group/commands';
import { JumpGroupCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-group/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpGroupCreatedEvent, JumpGroupCreationFailedEvent } from '../../events';
import { JumpGroupEntity } from '../../repositories/entities';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { CreateJumpGroupCommand } from '../create-jump-group.command';
import { CreateJumpGroupCommandHandler } from './create-jump-group.command-handler';

abstract class TestHelper {
    public static get mockedJumpGroupCreatedDtoOutput(): JumpGroupCreatedDtoOutput {
        return {
            id: 1,
            name: 'jump-group-1',
            codeName: 'jump-group-code-1',
            comments: 'jump-group-comments-1',
        };
    }
}

describe('CreateJumpGroupCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpGroupRepositoryService: JumpGroupRepositoryService;
    let handler: CreateJumpGroupCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpGroupRepositoryService = mockJumpGroupRepositoryService();
        handler = new CreateJumpGroupCommandHandler(commandBus, eventBus, jumpGroupRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <CreateJumpGroupCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                name: 'jump-group-1',
                codeName: 'jump-group-code-1',
                comments: 'jump-group-comments-1',
            },
            <CreateJumpGroupCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                name: 'jump-group-2',
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const jumpGroupEntityToBeCreated = { id: 123 } as JumpGroupEntity;
                const jumpGroupEntityCreateMethod = jest
                    .spyOn(JumpGroupEntity, 'create')
                    .mockReturnValue(jumpGroupEntityToBeCreated);

                const expectedResult = { id: 321 } as JumpGroupEntity;
                const jumpGroupRepositoryServiceCreateMethod = jest
                    .spyOn(jumpGroupRepositoryService, 'create')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTCreateJumpGroupCommand(
                        command.transactionId,
                        command.name,
                        command.codeName,
                        command.comments,
                    ),
                );
                expect(jumpGroupEntityCreateMethod).toHaveBeenCalledWith(
                    TestHelper.mockedJumpGroupCreatedDtoOutput.id,
                    TestHelper.mockedJumpGroupCreatedDtoOutput.name,
                    TestHelper.mockedJumpGroupCreatedDtoOutput.codeName,
                    TestHelper.mockedJumpGroupCreatedDtoOutput.comments,
                );
                expect(jumpGroupRepositoryServiceCreateMethod).toHaveBeenCalledWith(123, jumpGroupEntityToBeCreated);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<JumpGroupCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: JumpGroupCreatedEvent.EVENT_TYPE,
                        payload: {
                            jumpGroup: result,
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
                handler.execute(<CreateJumpGroupCommand>{
                    transactionId: 'transaction-1',
                    name: 'jump-group-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const jumpGroupEntityToBeCreated = { name: 'jump-group-1', id: 123 } as JumpGroupEntity;
            const jumpGroupEntityCreateMethod = jest
                .spyOn(JumpGroupEntity, 'create')
                .mockReturnValue(jumpGroupEntityToBeCreated);
            const expectedError = new Error('Error');
            const jumpGroupRepositoryServiceCreateMethod = jest
                .spyOn(jumpGroupRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CreateJumpGroupCommand>{
                    transactionId: 'transaction-1',
                    name: 'jump-group-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(jumpGroupEntityCreateMethod).toHaveBeenCalled();
            expect(jumpGroupRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: JumpGroupCreationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        jumpGroup: jumpGroupEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedJumpGroupCreatedDtoOutput);

    return commandBus;
}

function mockJumpGroupRepositoryService() {
    const jumpGroupRepositoryService = {} as JumpGroupRepositoryService;
    jumpGroupRepositoryService.create = jest.fn();

    return jumpGroupRepositoryService;
}
