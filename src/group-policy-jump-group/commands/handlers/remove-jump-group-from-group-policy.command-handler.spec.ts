import { CommandBus, EventBus } from '@nestjs/cqrs';
import { RemoveJumpGroupFromGroupPolicyCommand as BTRemoveJumpGroupFromGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyJumpGroupRemovalFailedEvent, GroupPolicyJumpGroupRemovedEvent } from '../../events';
import { GroupPolicyJumpGroupRepositoryService } from '../../repositories/services/group-policy-jump-group-repository.service';
import { RemoveJumpGroupFromGroupPolicyCommand } from '../remove-jump-group-from-group-policy.command';
import { RemoveJumpGroupFromGroupPolicyCommandHandler } from './remove-jump-group-from-group-policy.command-handler';

describe('RemoveJumpGroupFromGroupPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let groupPolicyJumpGroupRepositoryService: GroupPolicyJumpGroupRepositoryService;
    let handler: RemoveJumpGroupFromGroupPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        groupPolicyJumpGroupRepositoryService = mockGroupPolicyJumpGroupRepositoryService();
        handler = new RemoveJumpGroupFromGroupPolicyCommandHandler(
            commandBus,
            eventBus,
            groupPolicyJumpGroupRepositoryService,
        );
    });

    describe('execute', () => {
        it.each([
            <RemoveJumpGroupFromGroupPolicyCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
                jumpGroupId: 2,
            },
            <RemoveJumpGroupFromGroupPolicyCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                id: 3,
                jumpGroupId: 4,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
                const groupPolicyJumpGroupRepositoryServiceDeleteByGroupPolicyIdAndJumpGroupIdMethod = jest.spyOn(
                    groupPolicyJumpGroupRepositoryService,
                    'deleteByGroupPolicyIdAndJumpGroupId',
                );

                // Act
                await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTRemoveJumpGroupFromGroupPolicyCommand(command.transactionId, command.id, command.jumpGroupId),
                );
                expect(
                    groupPolicyJumpGroupRepositoryServiceDeleteByGroupPolicyIdAndJumpGroupIdMethod,
                ).toHaveBeenCalledWith(command.tenantId, command.id, command.jumpGroupId);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<GroupPolicyJumpGroupRemovedEvent>{
                        transactionId: command.transactionId,
                        eventType: GroupPolicyJumpGroupRemovedEvent.EVENT_TYPE,
                        payload: {
                            groupPolicyId: command.id,
                            jumpGroupId: command.jumpGroupId,
                            tenantId: 123,
                        },
                    }),
                );
            },
        );

        it('should throw an error if the command bus fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<RemoveJumpGroupFromGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    jumpGroupId: 4,
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const expectedError = new Error('Error');
            const groupPolicyJumpGroupRepositoryServiceDeleteByGroupPolicyIdAndJumpGroupIdMethod = jest
                .spyOn(groupPolicyJumpGroupRepositoryService, 'deleteByGroupPolicyIdAndJumpGroupId')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<RemoveJumpGroupFromGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    jumpGroupId: 4,
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(groupPolicyJumpGroupRepositoryServiceDeleteByGroupPolicyIdAndJumpGroupIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyJumpGroupRemovalFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        groupPolicyId: 3,
                        jumpGroupId: 4,
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
    commandBus.execute = jest.fn().mockReturnValue(Promise.resolve());

    return commandBus;
}

function mockGroupPolicyJumpGroupRepositoryService() {
    const groupPolicyJumpGroupRepositoryService = {} as GroupPolicyJumpGroupRepositoryService;
    groupPolicyJumpGroupRepositoryService.deleteByGroupPolicyIdAndJumpGroupId = jest.fn();

    return groupPolicyJumpGroupRepositoryService;
}
