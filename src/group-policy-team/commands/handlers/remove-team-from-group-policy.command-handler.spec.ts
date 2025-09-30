import { CommandBus, EventBus } from '@nestjs/cqrs';
import { RemoveTeamFromGroupPolicyCommand as BTRemoveTeamFromGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyTeamRemovalFailedEvent, GroupPolicyTeamRemovedEvent } from '../../events';
import { GroupPolicyTeamRepositoryService } from '../../repositories/services/group-policy-team-repository.service';
import { RemoveTeamFromGroupPolicyCommand } from '../remove-team-from-group-policy.command';
import { RemoveTeamFromGroupPolicyCommandHandler } from './remove-team-from-group-policy.command-handler';

describe('RemoveTeamFromGroupPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let groupPolicyTeamRepositoryService: GroupPolicyTeamRepositoryService;
    let handler: RemoveTeamFromGroupPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        groupPolicyTeamRepositoryService = mockGroupPolicyTeamRepositoryService();
        handler = new RemoveTeamFromGroupPolicyCommandHandler(commandBus, eventBus, groupPolicyTeamRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <RemoveTeamFromGroupPolicyCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
                teamId: 2,
            },
            <RemoveTeamFromGroupPolicyCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                id: 3,
                teamId: 4,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
                const groupPolicyTeamRepositoryServiceDeleteByGroupPolicyIdAndTeamIdMethod = jest.spyOn(
                    groupPolicyTeamRepositoryService,
                    'deleteByGroupPolicyIdAndTeamId',
                );

                // Act
                await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTRemoveTeamFromGroupPolicyCommand(
                        command.transactionId,
                        command.tenantId,
                        command.id,
                        command.teamId,
                    ),
                );
                expect(groupPolicyTeamRepositoryServiceDeleteByGroupPolicyIdAndTeamIdMethod).toHaveBeenCalledWith(
                    command.tenantId,
                    command.id,
                    command.teamId,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<GroupPolicyTeamRemovedEvent>{
                        transactionId: command.transactionId,
                        eventType: GroupPolicyTeamRemovedEvent.EVENT_TYPE,
                        payload: {
                            groupPolicyId: command.id,
                            teamId: command.teamId,
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
                handler.execute(<RemoveTeamFromGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    teamId: 4,
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const expectedError = new Error('Error');
            const groupPolicyTeamRepositoryServiceDeleteByGroupPolicyIdAndTeamIdMethod = jest
                .spyOn(groupPolicyTeamRepositoryService, 'deleteByGroupPolicyIdAndTeamId')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<RemoveTeamFromGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    teamId: 4,
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(groupPolicyTeamRepositoryServiceDeleteByGroupPolicyIdAndTeamIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyTeamRemovalFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        groupPolicyId: 3,
                        teamId: 4,
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

function mockGroupPolicyTeamRepositoryService() {
    const groupPolicyTeamRepositoryService = {} as GroupPolicyTeamRepositoryService;
    groupPolicyTeamRepositoryService.deleteByGroupPolicyIdAndTeamId = jest.fn();

    return groupPolicyTeamRepositoryService;
}
