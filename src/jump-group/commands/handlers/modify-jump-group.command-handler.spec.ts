import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ModifyJumpGroupCommand as BTModifyJumpGroupCommand } from '../../../beyondtrust-pra-conf-api/jump-group/commands';
import { JumpGroupModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-group/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpGroupModificationFailedEvent, JumpGroupModifiedEvent } from '../../events';
import { JumpGroupEntity } from '../../repositories/entities';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { ModifyJumpGroupCommand } from '../modify-jump-group.command';
import { ModifyJumpGroupCommandHandler } from './modify-jump-group.command-handler';

abstract class TestHelper {
    public static get mockedJumpGroupModifiedDtoOutput(): JumpGroupModifiedDtoOutput {
        return {
            id: 1,
            name: 'jump-group-1',
            codeName: 'jump-group-code-1',
            comments: 'jump-group-comments-1',
        };
    }
}

describe('ModifyJumpGroupCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpGroupRepositoryService: JumpGroupRepositoryService;
    let handler: ModifyJumpGroupCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpGroupRepositoryService = mockJumpGroupRepositoryService();
        handler = new ModifyJumpGroupCommandHandler(commandBus, eventBus, jumpGroupRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <ModifyJumpGroupCommand>{
                transactionId: 'transaction-1',
                id: 1,
                name: 'jump-group-1',
                codeName: 'jump-group-code-1',
                comments: 'jump-group-comments-1',
            },
            <ModifyJumpGroupCommand>{
                transactionId: 'transaction-2',
                id: 2,
                name: 'jump-group-2',
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const jumpGroupEntityToBeUpdated = { id: 123 } as JumpGroupEntity;
                const jumpGroupEntityCreateMethod = jest
                    .spyOn(JumpGroupEntity, 'create')
                    .mockReturnValue(jumpGroupEntityToBeUpdated);

                const expectedResult = { id: 321 } as JumpGroupEntity;
                const jumpGroupRepositoryServiceCreateOrUpdateByIdMethod = jest
                    .spyOn(jumpGroupRepositoryService, 'createOrUpdateById')
                    .mockResolvedValue(Promise.resolve());
                const jumpGroupRepositoryServiceFindByIdMethod = jest
                    .spyOn(jumpGroupRepositoryService, 'findOneById')
                    .mockResolvedValue(Promise.resolve(expectedResult));

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTModifyJumpGroupCommand(
                        command.transactionId,
                        command.id,
                        command.name,
                        command.codeName,
                        command.comments,
                    ),
                );
                expect(jumpGroupEntityCreateMethod).toHaveBeenCalledWith(
                    TestHelper.mockedJumpGroupModifiedDtoOutput.id,
                    TestHelper.mockedJumpGroupModifiedDtoOutput.name,
                    TestHelper.mockedJumpGroupModifiedDtoOutput.codeName,
                    TestHelper.mockedJumpGroupModifiedDtoOutput.comments,
                );
                expect(jumpGroupRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
                    jumpGroupEntityToBeUpdated,
                );
                expect(jumpGroupRepositoryServiceFindByIdMethod).toHaveBeenCalledWith(jumpGroupEntityToBeUpdated.id);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<JumpGroupModifiedEvent>{
                        transactionId: command.transactionId,
                        eventType: JumpGroupModifiedEvent.EVENT_TYPE,
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
                handler.execute(<ModifyJumpGroupCommand>{
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
            const jumpGroupRepositoryServiceCreateOrUpdateByIdMethod = jest
                .spyOn(jumpGroupRepositoryService, 'createOrUpdateById')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyJumpGroupCommand>{
                    transactionId: 'transaction-1',
                    name: 'jump-group-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(jumpGroupEntityCreateMethod).toHaveBeenCalled();
            expect(jumpGroupRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: JumpGroupModificationFailedEvent.EVENT_TYPE,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedJumpGroupModifiedDtoOutput);

    return commandBus;
}

function mockJumpGroupRepositoryService() {
    const jumpGroupRepositoryService = {} as JumpGroupRepositoryService;
    jumpGroupRepositoryService.createOrUpdateById = jest.fn();
    jumpGroupRepositoryService.findOneById = jest.fn();

    return jumpGroupRepositoryService;
}
