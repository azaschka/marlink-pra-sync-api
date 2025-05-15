import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ModifyTeamCommand as BTModifyTeamCommand } from '../../../beyondtrust-pra-conf-api/team/commands';
import { TeamModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { TeamModifiedEvent, TeamModificationFailedEvent } from '../../events';
import { TeamEntity } from '../../repositories/entities';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { ModifyTeamCommand } from '../modify-team.command';
import { ModifyTeamCommandHandler } from './modify-team.command-handler';

abstract class TestHelper {
    public static get mockedTeamModifiedDtoOutput(): TeamModifiedDtoOutput {
        return {
            id: 1,
            name: 'team-1',
            codeName: 'team-code-1',
            comments: 'team-comments-1',
        };
    }
}

describe('ModifyTeamCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let teamRepositoryService: TeamRepositoryService;
    let handler: ModifyTeamCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        teamRepositoryService = mockTeamRepositoryService();
        handler = new ModifyTeamCommandHandler(commandBus, eventBus, teamRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <ModifyTeamCommand>{
                transactionId: 'transaction-1',
                id: 1,
                name: 'team-1',
                codeName: 'team-code-1',
                comments: 'team-comments-1',
            },
            <ModifyTeamCommand>{
                transactionId: 'transaction-2',
                id: 2,
                name: 'team-2',
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const teamEntityToBeUpdated = { id: 123 } as TeamEntity;
                const teamEntityCreateMethod = jest.spyOn(TeamEntity, 'create').mockReturnValue(teamEntityToBeUpdated);

                const expectedResult = { id: 321 } as TeamEntity;
                const teamRepositoryServiceCreateOrUpdateByIdMethod = jest
                    .spyOn(teamRepositoryService, 'createOrUpdateById')
                    .mockResolvedValue(Promise.resolve());
                const teamRepositoryServiceFindByIdMethod = jest
                    .spyOn(teamRepositoryService, 'findOneById')
                    .mockResolvedValue(Promise.resolve(expectedResult));

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTModifyTeamCommand(
                        command.transactionId,
                        command.id,
                        command.name,
                        command.codeName,
                        command.comments,
                    ),
                );
                expect(teamEntityCreateMethod).toHaveBeenCalledWith(
                    TestHelper.mockedTeamModifiedDtoOutput.id,
                    TestHelper.mockedTeamModifiedDtoOutput.name,
                    TestHelper.mockedTeamModifiedDtoOutput.codeName,
                    TestHelper.mockedTeamModifiedDtoOutput.comments,
                );
                expect(teamRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith(teamEntityToBeUpdated);
                expect(teamRepositoryServiceFindByIdMethod).toHaveBeenCalledWith(teamEntityToBeUpdated.id);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<TeamModifiedEvent>{
                        transactionId: command.transactionId,
                        eventType: TeamModifiedEvent.EVENT_TYPE,
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
                handler.execute(<ModifyTeamCommand>{
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
            const teamRepositoryServiceCreateOrUpdateByIdMethod = jest
                .spyOn(teamRepositoryService, 'createOrUpdateById')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyTeamCommand>{
                    transactionId: 'transaction-1',
                    name: 'team-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(teamEntityCreateMethod).toHaveBeenCalled();
            expect(teamRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: TeamModificationFailedEvent.EVENT_TYPE,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedTeamModifiedDtoOutput);

    return commandBus;
}

function mockTeamRepositoryService() {
    const teamRepositoryService = {} as TeamRepositoryService;
    teamRepositoryService.createOrUpdateById = jest.fn();
    teamRepositoryService.findOneById = jest.fn();

    return teamRepositoryService;
}
