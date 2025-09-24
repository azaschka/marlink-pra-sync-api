import { CommandBus, EventBus } from '@nestjs/cqrs';
import { RemoveJumpointFromGroupPolicyCommand as BTRemoveJumpointFromGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyJumpointRemovalFailedEvent, GroupPolicyJumpointRemovedEvent } from '../../events';
import { GroupPolicyJumpointRepositoryService } from '../../repositories/services/group-policy-jumpoint-repository.service';
import { RemoveJumpointFromGroupPolicyCommand } from '../remove-jumpoint-from-group-policy.command';
import { RemoveJumpointFromGroupPolicyCommandHandler } from './remove-jumpoint-from-group-policy.command-handler';

describe('RemoveJumpointFromGroupPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let groupPolicyJumpointRepositoryService: GroupPolicyJumpointRepositoryService;
    let handler: RemoveJumpointFromGroupPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        groupPolicyJumpointRepositoryService = mockGroupPolicyJumpointRepositoryService();
        handler = new RemoveJumpointFromGroupPolicyCommandHandler(
            commandBus,
            eventBus,
            groupPolicyJumpointRepositoryService,
        );
    });

    describe('execute', () => {
        it.each([
            <RemoveJumpointFromGroupPolicyCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
                jumpointId: 2,
            },
            <RemoveJumpointFromGroupPolicyCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                id: 3,
                jumpointId: 4,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
                const groupPolicyJumpointRepositoryServiceDeleteByGroupPolicyIdAndJumpointIdMethod = jest.spyOn(
                    groupPolicyJumpointRepositoryService,
                    'deleteByGroupPolicyIdAndJumpointId',
                );

                // Act
                await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTRemoveJumpointFromGroupPolicyCommand(command.transactionId, command.id, command.jumpointId),
                );
                expect(
                    groupPolicyJumpointRepositoryServiceDeleteByGroupPolicyIdAndJumpointIdMethod,
                ).toHaveBeenCalledWith(command.tenantId, command.id, command.jumpointId);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<GroupPolicyJumpointRemovedEvent>{
                        transactionId: command.transactionId,
                        eventType: GroupPolicyJumpointRemovedEvent.EVENT_TYPE,
                        payload: {
                            groupPolicyId: command.id,
                            jumpointId: command.jumpointId,
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
                handler.execute(<RemoveJumpointFromGroupPolicyCommand>{
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
            const expectedError = new Error('Error');
            const groupPolicyJumpointRepositoryServiceDeleteByGroupPolicyIdAndJumpointIdMethod = jest
                .spyOn(groupPolicyJumpointRepositoryService, 'deleteByGroupPolicyIdAndJumpointId')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<RemoveJumpointFromGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    jumpointId: 4,
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(groupPolicyJumpointRepositoryServiceDeleteByGroupPolicyIdAndJumpointIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyJumpointRemovalFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        groupPolicyId: 3,
                        jumpointId: 4,
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

function mockGroupPolicyJumpointRepositoryService() {
    const groupPolicyJumpointRepositoryService = {} as GroupPolicyJumpointRepositoryService;
    groupPolicyJumpointRepositoryService.deleteByGroupPolicyIdAndJumpointId = jest.fn();

    return groupPolicyJumpointRepositoryService;
}
