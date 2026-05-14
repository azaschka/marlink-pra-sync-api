import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { CreateTeamCommand as BTCreateTeamCommand } from '../../../beyondtrust-pra-conf-api/team/commands';
import { TeamCreatedDtoOutput, TeamRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { RetrieveTeamsQuery as BTRetrieveTeamsQuery } from '../../../beyondtrust-pra-conf-api/team/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { TeamCreatedEvent, TeamCreationFailedEvent } from '../../events';
import { TeamEntity } from '../../repositories/entities';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { CreateTeamCommand } from '../create-team.command';
import { CreateTeamCommandHandler } from './create-team.command-handler';

/* eslint-disable @typescript-eslint/unbound-method */

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
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let teamRepositoryService: TeamRepositoryService;
    let handler: CreateTeamCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        teamRepositoryService = mockTeamRepositoryService();
        handler = new CreateTeamCommandHandler(commandBus, queryBus, eventBus, teamRepositoryService);
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

                jest.spyOn(commandBus, 'execute');

                jest.spyOn(eventBus, 'publish');

                const teamEntityToBeCreated = { id: 123 } as TeamEntity;

                jest.spyOn(TeamEntity, 'create').mockReturnValue(teamEntityToBeCreated);

                const expectedResult = { id: 321 } as TeamEntity;

                jest.spyOn(teamRepositoryService, 'create').mockResolvedValue(expectedResult);

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBus.execute).toHaveBeenCalledWith(
                    new BTCreateTeamCommand(
                        command.transactionId,
                        command.tenantId,
                        command.name,
                        command.codeName,
                        command.comments,
                    ),
                );
                expect(TeamEntity.create).toHaveBeenCalledWith(
                    TestHelper.mockedTeamCreatedDtoOutput.id,
                    TestHelper.mockedTeamCreatedDtoOutput.name,
                    TestHelper.mockedTeamCreatedDtoOutput.codeName,
                    TestHelper.mockedTeamCreatedDtoOutput.comments,
                );
                expect(teamRepositoryService.create).toHaveBeenCalledWith(123, teamEntityToBeCreated);
                expect(eventBus.publish).toHaveBeenCalledWith(
                    expect.objectContaining(<TeamCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: TeamCreatedEvent.EVENT_TYPE,
                        payload: {
                            team: result,
                            tenantId: 123,
                        },
                    }),
                );
                expect(result).toBe(expectedResult);
            },
        );

        it('should throw an error if the command bus fails with a non-422 error', async () => {
            // Arrange
            jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<CreateTeamCommand>{
                    transactionId: 'transaction-1',
                    name: 'team-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBus.execute).toHaveBeenCalled();
        });

        it('should fetch existing team from BeyondTrust and upsert to local DB when BT returns 422 name-already-taken', async () => {
            // Arrange
            const command = <CreateTeamCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                name: 'team-1',
                codeName: 'team-code-1',
                comments: 'team-comments-1',
            };

            const alreadyTakenError = new HttpException({}, HttpStatus.UNPROCESSABLE_ENTITY);

            jest.spyOn(commandBus, 'execute').mockRejectedValue(alreadyTakenError);

            const existingBTTeam: TeamRetrievedDtoOutput = {
                id: 1,
                name: 'team-1',
                codeName: 'team-code-1',
                comments: 'team-comments-1',
            };

            jest.spyOn(queryBus, 'execute').mockResolvedValue([existingBTTeam]);

            const teamEntityToBeUpserted = { id: 1, name: 'team-1' } as TeamEntity;

            jest.spyOn(TeamEntity, 'create').mockReturnValue(teamEntityToBeUpserted);

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(queryBus.execute).toHaveBeenCalledWith(
                new BTRetrieveTeamsQuery(command.transactionId, command.tenantId, 1, 1, command.name),
            );
            expect(teamRepositoryService.createOrUpdateById).toHaveBeenCalledWith(
                command.tenantId,
                teamEntityToBeUpserted,
            );
            expect(teamRepositoryService.create).not.toHaveBeenCalled();
            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.objectContaining(<TeamCreatedEvent>{
                    transactionId: command.transactionId,
                    eventType: TeamCreatedEvent.EVENT_TYPE,
                    payload: { team: teamEntityToBeUpserted, tenantId: 123 },
                }),
            );
            expect(result).toBe(teamEntityToBeUpserted);
        });

        it('should rethrow 422 error if team cannot be found in BeyondTrust after name-already-taken', async () => {
            // Arrange
            const command = <CreateTeamCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                name: 'team-1',
            };

            const alreadyTakenError = new HttpException({}, HttpStatus.UNPROCESSABLE_ENTITY);

            jest.spyOn(commandBus, 'execute').mockRejectedValue(alreadyTakenError);

            jest.spyOn(queryBus, 'execute').mockResolvedValue([]);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(alreadyTakenError);
            expect(queryBus.execute).toHaveBeenCalledWith(
                new BTRetrieveTeamsQuery(command.transactionId, command.tenantId, 1, 1, command.name),
            );
            expect(teamRepositoryService.createOrUpdateById).not.toHaveBeenCalled();
            expect(teamRepositoryService.create).not.toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange

            jest.spyOn(commandBus, 'execute');
            const teamEntityToBeCreated = { name: 'team-1', id: 123 } as TeamEntity;

            jest.spyOn(TeamEntity, 'create').mockReturnValue(teamEntityToBeCreated);
            const expectedError = new Error('Error');

            jest.spyOn(teamRepositoryService, 'create').mockRejectedValue(expectedError);

            jest.spyOn(eventBus, 'publish');

            jest.spyOn(ErrorProcessorUtility, 'stringify').mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CreateTeamCommand>{
                    transactionId: 'transaction-1',
                    name: 'team-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBus.execute).toHaveBeenCalled();
            expect(TeamEntity.create).toHaveBeenCalled();
            expect(teamRepositoryService.create).toHaveBeenCalled();
            expect(ErrorProcessorUtility.stringify).toHaveBeenCalledWith(expectedError);
            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: TeamCreationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        team: teamEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedTeamCreatedDtoOutput);

    return commandBus;
}

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue([]);

    return queryBus;
}

function mockTeamRepositoryService() {
    const teamRepositoryService = {} as TeamRepositoryService;
    teamRepositoryService.create = jest.fn();
    teamRepositoryService.createOrUpdateById = jest.fn().mockResolvedValue(undefined);

    return teamRepositoryService;
}
/* eslint-enable @typescript-eslint/unbound-method */
