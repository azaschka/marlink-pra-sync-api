import { CommandBus, EventBus } from '@nestjs/cqrs';
import { RemoveUserFromTeamCommand as BTRemoveUserFromTeamCommand } from '../../../beyondtrust-pra-conf-api/team/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { TeamUserRemovalFailedEvent, TeamUserRemovedEvent } from '../../events';
import { TeamUserRepositoryService } from '../../repositories/services/team-user-repository.service';
import { RemoveUserFromTeamCommand } from '../remove-user-from-team.command';
import { RemoveUserFromTeamCommandHandler } from './remove-user-from-team.command-handler';

describe('RemoveUserFromTeamCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let teamUserRepositoryService: TeamUserRepositoryService;
    let handler: RemoveUserFromTeamCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        teamUserRepositoryService = mockTeamUserRepositoryService();
        handler = new RemoveUserFromTeamCommandHandler(commandBus, eventBus, teamUserRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <RemoveUserFromTeamCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
                userId: 2,
            },
            <RemoveUserFromTeamCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                id: 3,
                userId: 4,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
                const teamUserRepositoryServiceDeleteByTeamIdAndUserIdMethod = jest.spyOn(
                    teamUserRepositoryService,
                    'deleteByTeamIdAndUserId',
                );

                // Act
                await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTRemoveUserFromTeamCommand(command.transactionId, command.id, command.userId),
                );
                expect(teamUserRepositoryServiceDeleteByTeamIdAndUserIdMethod).toHaveBeenCalledWith(
                    123,
                    command.id,
                    command.userId,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<TeamUserRemovedEvent>{
                        transactionId: command.transactionId,
                        eventType: TeamUserRemovedEvent.EVENT_TYPE,
                        payload: {
                            teamId: command.id,
                            userId: command.userId,
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
                handler.execute(<RemoveUserFromTeamCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    userId: 4,
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const expectedError = new Error('Error');
            const teamUserRepositoryServiceDeleteByTeamIdAndUserIdMethod = jest
                .spyOn(teamUserRepositoryService, 'deleteByTeamIdAndUserId')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<RemoveUserFromTeamCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    userId: 4,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(teamUserRepositoryServiceDeleteByTeamIdAndUserIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: TeamUserRemovalFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        teamId: 3,
                        userId: 4,
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

function mockTeamUserRepositoryService() {
    const teamUserRepositoryService = {} as TeamUserRepositoryService;
    teamUserRepositoryService.deleteByTeamIdAndUserId = jest.fn();

    return teamUserRepositoryService;
}
