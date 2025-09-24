import { CommandBus, EventBus } from '@nestjs/cqrs';
import { RemoveMemberFromGroupPolicyCommand as BTRemoveMemberFromGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyMemberRemovalFailedEvent, GroupPolicyMemberRemovedEvent } from '../../events';
import { GroupPolicyMemberRepositoryService } from '../../repositories/services/group-policy-member-repository.service';
import { RemoveMemberFromGroupPolicyCommand } from '../remove-member-from-group-policy.command';
import { RemoveMemberFromGroupPolicyCommandHandler } from './remove-member-from-group-policy.command-handler';

describe('RemoveMemberFromGroupPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService;
    let handler: RemoveMemberFromGroupPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        groupPolicyMemberRepositoryService = mockGroupPolicyMemberRepositoryService();
        handler = new RemoveMemberFromGroupPolicyCommandHandler(
            commandBus,
            eventBus,
            groupPolicyMemberRepositoryService,
        );
    });

    describe('execute', () => {
        it.each([
            <RemoveMemberFromGroupPolicyCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
                memberId: 2,
            },
            <RemoveMemberFromGroupPolicyCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                id: 3,
                memberId: 4,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
                const groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdAndMemberIdMethod = jest.spyOn(
                    groupPolicyMemberRepositoryService,
                    'deleteByGroupPolicyIdAndMemberId',
                );

                // Act
                await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTRemoveMemberFromGroupPolicyCommand(command.transactionId, command.id, command.memberId),
                );
                expect(groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdAndMemberIdMethod).toHaveBeenCalledWith(
                    command.tenantId,
                    command.id,
                    command.memberId,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<GroupPolicyMemberRemovedEvent>{
                        transactionId: command.transactionId,
                        eventType: GroupPolicyMemberRemovedEvent.EVENT_TYPE,
                        payload: {
                            groupPolicyId: command.id,
                            memberId: command.memberId,
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
                handler.execute(<RemoveMemberFromGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    memberId: 4,
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const expectedError = new Error('Error');
            const groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdAndMemberIdMethod = jest
                .spyOn(groupPolicyMemberRepositoryService, 'deleteByGroupPolicyIdAndMemberId')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<RemoveMemberFromGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    memberId: 4,
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdAndMemberIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyMemberRemovalFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        groupPolicyId: 3,
                        memberId: 4,
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

function mockGroupPolicyMemberRepositoryService() {
    const groupPolicyMemberRepositoryService = {} as GroupPolicyMemberRepositoryService;
    groupPolicyMemberRepositoryService.deleteByGroupPolicyIdAndMemberId = jest.fn();

    return groupPolicyMemberRepositoryService;
}
