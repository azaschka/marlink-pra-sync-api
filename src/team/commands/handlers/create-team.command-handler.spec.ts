import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateTeamCommand as BTCreateTeamCommand } from '../../../beyondtrust-pra-conf-api/team/commands';
import { TeamCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { TeamCreatedEvent, TeamCreationFailedEvent } from '../../events';
import { TeamEntity } from '../../repositories/entities';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { CreateTeamCommand } from '../create-team.command';
import { CreateTeamCommandHandler } from './create-team.command-handler';

abstract class TestHelper {
    public static get mockedTeamCreatedDtoOutput(): TeamCreatedDtoOutput {
        return {
            id: 1,
            name: 'team-1',
            codeName: 'team-code-1',
            comments: 'team-comments-1',
        };
    }
}

describe('CreateTeamCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let teamRepositoryService: TeamRepositoryService;
    let handler: CreateTeamCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        teamRepositoryService = mockTeamRepositoryService();
        handler = new CreateTeamCommandHandler(commandBus, eventBus, teamRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <CreateTeamCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                name: 'team-1',
                codeName: 'team-code-1',
                comments: 'team-comments-1',
            },
            <CreateTeamCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                name: 'team-2',
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const teamEntityToBeCreated = { id: 123 } as TeamEntity;
                const teamEntityCreateMethod = jest.spyOn(TeamEntity, 'create').mockReturnValue(teamEntityToBeCreated);

                const expectedResult = { id: 321 } as TeamEntity;
                const teamRepositoryServiceCreateMethod = jest
                    .spyOn(teamRepositoryService, 'create')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTCreateTeamCommand(command.transactionId, command.name, command.codeName, command.comments),
                );
                expect(teamEntityCreateMethod).toHaveBeenCalledWith(
                    TestHelper.mockedTeamCreatedDtoOutput.id,
                    TestHelper.mockedTeamCreatedDtoOutput.name,
                    TestHelper.mockedTeamCreatedDtoOutput.codeName,
                    TestHelper.mockedTeamCreatedDtoOutput.comments,
                );
                expect(teamRepositoryServiceCreateMethod).toHaveBeenCalledWith(123, teamEntityToBeCreated);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<TeamCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: TeamCreatedEvent.EVENT_TYPE,
                        payload: {
                            team: result,
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
                handler.execute(<CreateTeamCommand>{
                    transactionId: 'transaction-1',
                    name: 'team-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const teamEntityToBeCreated = { name: 'team-1', id: 123 } as TeamEntity;
            const teamEntityCreateMethod = jest.spyOn(TeamEntity, 'create').mockReturnValue(teamEntityToBeCreated);
            const expectedError = new Error('Error');
            const teamRepositoryServiceCreateMethod = jest
                .spyOn(teamRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CreateTeamCommand>{
                    transactionId: 'transaction-1',
                    name: 'team-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(teamEntityCreateMethod).toHaveBeenCalled();
            expect(teamRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: TeamCreationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        team: teamEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedTeamCreatedDtoOutput);

    return commandBus;
}

function mockTeamRepositoryService() {
    const teamRepositoryService = {} as TeamRepositoryService;
    teamRepositoryService.create = jest.fn();

    return teamRepositoryService;
}
