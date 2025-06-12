import { CommandBus, EventBus } from '@nestjs/cqrs';
import { AddJumpointToGroupPolicyCommand as BTAddJumpointToGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { JumpointAddedToGroupPolicyDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyJumpointAddedEvent, GroupPolicyJumpointAdditionFailedEvent } from '../../events';
import { GroupPolicyJumpointEntity } from '../../repositories/entities';
import { GroupPolicyJumpointRepositoryService } from '../../repositories/services/group-policy-jumpoint-repository.service';
import { AddJumpointToGroupPolicyCommand } from '../add-jumpoint-to-group-policy.command';
import { AddJumpointToGroupPolicyCommandHandler } from './add-jumpoint-to-group-policy.command-handler';

abstract class TestHelper {
    public static get mockedJumpointAddedToGroupPolicyDtoOutput(): JumpointAddedToGroupPolicyDtoOutput {
        return {
            jumpointId: 1,
        };
    }
}

describe('AddJumpointToGroupPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let groupPolicyJumpointRepositoryService: GroupPolicyJumpointRepositoryService;
    let handler: AddJumpointToGroupPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        groupPolicyJumpointRepositoryService = mockGroupPolicyJumpointRepositoryService();
        handler = new AddJumpointToGroupPolicyCommandHandler(
            commandBus,
            eventBus,
            groupPolicyJumpointRepositoryService,
        );
    });

    describe('execute', () => {
        it.each([
            <AddJumpointToGroupPolicyCommand>{
                transactionId: 'transaction-1',
                id: 1,
                jumpointId: 2,
            },
            <AddJumpointToGroupPolicyCommand>{
                transactionId: 'transaction-2',
                id: 3,
                jumpointId: 4,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const groupPolicyJumpointEntityToBeCreated = {
                    groupPolicyId: 100,
                    jumpointId: 101,
                } as GroupPolicyJumpointEntity;
                const groupPolicyJumpointEntityCreateMethod = jest
                    .spyOn(GroupPolicyJumpointEntity, 'create')
                    .mockReturnValue(groupPolicyJumpointEntityToBeCreated);
                const groupPolicyJumpointRepositoryServiceCreateMethod = jest.spyOn(
                    groupPolicyJumpointRepositoryService,
                    'create',
                );

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTAddJumpointToGroupPolicyCommand(command.transactionId, command.id, command.jumpointId),
                );
                expect(groupPolicyJumpointEntityCreateMethod).toHaveBeenCalledWith(
                    command.id,
                    TestHelper.mockedJumpointAddedToGroupPolicyDtoOutput.jumpointId,
                );
                expect(groupPolicyJumpointRepositoryServiceCreateMethod).toHaveBeenCalledWith(
                    groupPolicyJumpointEntityToBeCreated,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<GroupPolicyJumpointAddedEvent>{
                        transactionId: command.transactionId,
                        eventType: GroupPolicyJumpointAddedEvent.EVENT_TYPE,
                        payload: {
                            groupPolicyJumpoint: result,
                        },
                    }),
                );
                expect(result).toStrictEqual({
                    groupPolicyId: groupPolicyJumpointEntityToBeCreated.groupPolicyId,
                    jumpointId: groupPolicyJumpointEntityToBeCreated.jumpointId,
                });
            },
        );

        it('should throw an error if the command bus fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<AddJumpointToGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    jumpointId: 4,
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const groupPolicyJumpointEntityToBeCreated = {
                groupPolicyId: 100,
                jumpointId: 101,
            } as GroupPolicyJumpointEntity;
            const groupPolicyJumpointEntityCreateMethod = jest
                .spyOn(GroupPolicyJumpointEntity, 'create')
                .mockReturnValue(groupPolicyJumpointEntityToBeCreated);
            const expectedError = new Error('Error');
            const groupPolicyJumpointRepositoryServiceCreateMethod = jest
                .spyOn(groupPolicyJumpointRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<AddJumpointToGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    jumpointId: 4,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(groupPolicyJumpointEntityCreateMethod).toHaveBeenCalled();
            expect(groupPolicyJumpointRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyJumpointAdditionFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        groupPolicyJumpoint: {
                            groupPolicyId: groupPolicyJumpointEntityToBeCreated.groupPolicyId,
                            jumpointId: groupPolicyJumpointEntityToBeCreated.jumpointId,
                        },
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedJumpointAddedToGroupPolicyDtoOutput);

    return commandBus;
}

function mockGroupPolicyJumpointRepositoryService() {
    const groupPolicyJumpointRepositoryService = {} as GroupPolicyJumpointRepositoryService;
    groupPolicyJumpointRepositoryService.create = jest.fn();

    return groupPolicyJumpointRepositoryService;
}
