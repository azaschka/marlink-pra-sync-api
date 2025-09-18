import { CommandBus, EventBus } from '@nestjs/cqrs';
import { AddUserToTeamCommand as BTAddUserToTeamCommand } from '../../../beyondtrust-pra-conf-api/team/commands';
import { UserAddedToTeamDtoOutput } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { UserTeamRoleType as BTUserTeamRoleType } from '../../../beyondtrust-pra-conf-api/team/enums';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UserTeamRoleType } from '../../enums';
import { TeamUserAddedEvent, TeamUserAdditionFailedEvent } from '../../events';
import { TeamUserEntity } from '../../repositories/entities';
import { TeamUserRepositoryService } from '../../repositories/services/team-user-repository.service';
import { AddUserToTeamCommand } from '../add-user-to-team.command';
import { AddUserToTeamCommandHandler } from './add-user-to-team.command-handler';

abstract class TestHelper {
    public static get mockedUserAddedToTeamDtoOutput(): UserAddedToTeamDtoOutput {
        return {
            userId: 1,
            role: BTUserTeamRoleType.Manager,
        };
    }
}

describe('AddUserToTeamCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let teamUserRepositoryService: TeamUserRepositoryService;
    let handler: AddUserToTeamCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        teamUserRepositoryService = mockTeamUserRepositoryService();
        handler = new AddUserToTeamCommandHandler(commandBus, eventBus, teamUserRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <AddUserToTeamCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
                userId: 2,
                roleType: UserTeamRoleType.Member,
            },
            <AddUserToTeamCommand>{
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

                const teamUserEntityToBeCreated = {
                    teamId: 100,
                    userId: 101,
                    roleType: UserTeamRoleType.Manager,
                    lastSyncDate: new Date('2025-01-01'),
                } as TeamUserEntity;
                const teamUserEntityCreateMethod = jest
                    .spyOn(TeamUserEntity, 'create')
                    .mockReturnValue(teamUserEntityToBeCreated);
                const teamUserRepositoryServiceCreateMethod = jest.spyOn(teamUserRepositoryService, 'create');

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTAddUserToTeamCommand(command.transactionId, command.id, command.userId, command.roleType),
                );
                expect(teamUserEntityCreateMethod).toHaveBeenCalledWith(
                    command.id,
                    TestHelper.mockedUserAddedToTeamDtoOutput.userId,
                    TestHelper.mockedUserAddedToTeamDtoOutput.role,
                );
                expect(teamUserRepositoryServiceCreateMethod).toHaveBeenCalledWith(123, teamUserEntityToBeCreated);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<TeamUserAddedEvent>{
                        transactionId: command.transactionId,
                        eventType: TeamUserAddedEvent.EVENT_TYPE,
                        payload: {
                            teamUser: result,
                        },
                    }),
                );
                expect(result).toStrictEqual({
                    teamId: teamUserEntityToBeCreated.teamId,
                    userId: teamUserEntityToBeCreated.userId,
                    roleType: teamUserEntityToBeCreated.roleType,
                    lastSyncDate: new Date('2025-01-01'),
                });
            },
        );

        it('should throw an error if the command bus fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<AddUserToTeamCommand>{
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
            const teamUserEntityToBeCreated = {
                teamId: 100,
                userId: 101,
                roleType: UserTeamRoleType.Manager,
            } as TeamUserEntity;
            const teamUserEntityCreateMethod = jest
                .spyOn(TeamUserEntity, 'create')
                .mockReturnValue(teamUserEntityToBeCreated);
            const expectedError = new Error('Error');
            const teamUserRepositoryServiceCreateMethod = jest
                .spyOn(teamUserRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<AddUserToTeamCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    userId: 4,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(teamUserEntityCreateMethod).toHaveBeenCalled();
            expect(teamUserRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: TeamUserAdditionFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        teamUser: {
                            teamId: teamUserEntityToBeCreated.teamId,
                            userId: teamUserEntityToBeCreated.userId,
                            roleType: UserTeamRoleType.Manager,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedUserAddedToTeamDtoOutput);

    return commandBus;
}

function mockTeamUserRepositoryService() {
    const teamUserRepositoryService = {} as TeamUserRepositoryService;
    teamUserRepositoryService.create = jest.fn();

    return teamUserRepositoryService;
}
