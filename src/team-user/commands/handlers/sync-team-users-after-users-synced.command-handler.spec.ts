import { EventBus, QueryBus } from '@nestjs/cqrs';
import { UserTeamRoleType as BTUserTeamRoleType } from '../../../beyondtrust-pra-conf-api/team/enums';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UserTeamRoleType } from '../../enums';
import { TeamUsersSyncedEvent, TeamUsersSyncFailedEvent } from '../../events';
import { TeamUserEntity } from '../../repositories/entities';
import { TeamUserRepositoryService } from '../../repositories/services/team-user-repository.service';
import { SyncTeamUsersAfterTeamsSyncedCommand } from '../sync-team-users-after-teams-synced.command';
import { SyncTeamUsersAfterTeamsSyncedCommandHandler } from './sync-team-users-after-users-synced.command-handler';

describe('SyncTeamUsersAfterTeamsSyncedCommandHandler', () => {
    let eventBus: EventBus;
    let queryBus: QueryBus;
    let teamUserRepositoryService: TeamUserRepositoryService;
    let handler: SyncTeamUsersAfterTeamsSyncedCommandHandler;

    beforeEach(() => {
        eventBus = mockEventBus();
        queryBus = mockQueryBus();
        teamUserRepositoryService = mockTeamUserRepositoryService();
        handler = new SyncTeamUsersAfterTeamsSyncedCommandHandler(queryBus, eventBus, teamUserRepositoryService);
    });

    describe('execute', () => {
        it('should call the query bus and repository service with correct parameters and publish an event', async () => {
            // Arrange
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce([
                    { teamId: 1, userId: 1, role: BTUserTeamRoleType.Manager },
                    { teamId: 1, userId: 2, role: BTUserTeamRoleType.Lead },
                    { teamId: 1, userId: 3, role: BTUserTeamRoleType.Member },
                ])
                .mockResolvedValueOnce([
                    { teamId: 2, userId: 4, role: BTUserTeamRoleType.Manager },
                    { teamId: 2, userId: 5, role: BTUserTeamRoleType.Lead },
                ])
                .mockResolvedValueOnce([]) // teamId 3
                .mockResolvedValueOnce([{ teamId: 4, userId: 6, role: BTUserTeamRoleType.Member }]);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const teamUserEntityCreateMethod = jest
                .spyOn(TeamUserEntity, 'create')
                .mockImplementation((teamId: number, userId: number, roleType: UserTeamRoleType) => {
                    return { teamId, userId, roleType } as TeamUserEntity;
                });

            const teamUserRepositoryServiceDeleteByTeamIdsMethod = jest
                .spyOn(teamUserRepositoryService, 'deleteByTeamIds')
                .mockResolvedValue(Promise.resolve());
            const teamUserRepositoryServiceDeleteByTeamIdMethod = jest
                .spyOn(teamUserRepositoryService, 'deleteByTeamId')
                .mockResolvedValue(Promise.resolve());
            const teamUserRepositoryServiceCreateOrUpdateByTeamIdAndUserIdMethod = jest
                .spyOn(teamUserRepositoryService, 'createOrUpdateByTeamIdAndUserId')
                .mockResolvedValue(Promise.resolve());

            // Act
            await handler.execute(new SyncTeamUsersAfterTeamsSyncedCommand('transaction-1', [1, 2], [3, 4], [5, 6]));

            // Assert
            // createdUserIds: [1, 2]
            // updatedUserIds: [3, 4]
            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(4);
            expect(teamUserEntityCreateMethod).toHaveBeenCalledTimes(6);
            expect(teamUserEntityCreateMethod).toHaveBeenNthCalledWith(1, 1, 1, UserTeamRoleType.Manager);
            expect(teamUserEntityCreateMethod).toHaveBeenNthCalledWith(2, 1, 2, UserTeamRoleType.Lead);
            expect(teamUserEntityCreateMethod).toHaveBeenNthCalledWith(3, 1, 3, UserTeamRoleType.Member);
            expect(teamUserEntityCreateMethod).toHaveBeenNthCalledWith(4, 2, 4, UserTeamRoleType.Manager);
            expect(teamUserEntityCreateMethod).toHaveBeenNthCalledWith(5, 2, 5, UserTeamRoleType.Lead);
            expect(teamUserEntityCreateMethod).toHaveBeenNthCalledWith(6, 4, 6, UserTeamRoleType.Member);
            expect(teamUserRepositoryServiceDeleteByTeamIdMethod).toHaveBeenCalledTimes(4);
            expect(teamUserRepositoryServiceDeleteByTeamIdMethod).toHaveBeenNthCalledWith(1, 1);
            expect(teamUserRepositoryServiceDeleteByTeamIdMethod).toHaveBeenNthCalledWith(2, 2);
            expect(teamUserRepositoryServiceDeleteByTeamIdMethod).toHaveBeenNthCalledWith(3, 3);
            expect(teamUserRepositoryServiceDeleteByTeamIdMethod).toHaveBeenNthCalledWith(4, 4);
            expect(teamUserRepositoryServiceCreateOrUpdateByTeamIdAndUserIdMethod).toHaveBeenCalledTimes(4);
            expect(teamUserRepositoryServiceCreateOrUpdateByTeamIdAndUserIdMethod).toHaveBeenNthCalledWith(1, [
                { teamId: 1, userId: 1, roleType: UserTeamRoleType.Manager },
                { teamId: 1, userId: 2, roleType: UserTeamRoleType.Lead },
                { teamId: 1, userId: 3, roleType: UserTeamRoleType.Member },
            ]);
            expect(teamUserRepositoryServiceCreateOrUpdateByTeamIdAndUserIdMethod).toHaveBeenNthCalledWith(2, [
                { teamId: 2, userId: 4, roleType: UserTeamRoleType.Manager },
                { teamId: 2, userId: 5, roleType: UserTeamRoleType.Lead },
            ]);
            expect(teamUserRepositoryServiceCreateOrUpdateByTeamIdAndUserIdMethod).toHaveBeenNthCalledWith(3, []);
            expect(teamUserRepositoryServiceCreateOrUpdateByTeamIdAndUserIdMethod).toHaveBeenNthCalledWith(4, [
                { teamId: 4, userId: 6, roleType: UserTeamRoleType.Member },
            ]);
            expect(eventBusPublishMethod).toHaveBeenCalledTimes(3);
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining(<TeamUsersSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: TeamUsersSyncedEvent.EVENT_TYPE,
                    payload: {
                        teamUsers: [
                            {
                                teamId: 1,
                                userId: 1,
                                roleType: UserTeamRoleType.Manager,
                            },
                            {
                                teamId: 1,
                                userId: 2,
                                roleType: UserTeamRoleType.Lead,
                            },
                            {
                                teamId: 1,
                                userId: 3,
                                roleType: UserTeamRoleType.Member,
                            },
                        ],
                    },
                }),
            );
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining(<TeamUsersSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: TeamUsersSyncedEvent.EVENT_TYPE,
                    payload: {
                        teamUsers: [
                            {
                                teamId: 2,
                                userId: 4,
                                roleType: UserTeamRoleType.Manager,
                            },
                            {
                                teamId: 2,
                                userId: 5,
                                roleType: UserTeamRoleType.Lead,
                            },
                        ],
                    },
                }),
            );
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                3,
                expect.objectContaining(<TeamUsersSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: TeamUsersSyncedEvent.EVENT_TYPE,
                    payload: {
                        teamUsers: [
                            {
                                teamId: 4,
                                userId: 6,
                                roleType: UserTeamRoleType.Member,
                            },
                        ],
                    },
                }),
            );

            // deletedUserIds: [5, 6]
            expect(teamUserRepositoryServiceDeleteByTeamIdsMethod).toHaveBeenCalledTimes(1);
            expect(teamUserRepositoryServiceDeleteByTeamIdsMethod).toHaveBeenCalledWith([5, 6]);
        });

        it('should publish an event and not throw error when failure occurs', async () => {
            // Arrange
            queryBus.execute = jest.fn().mockRejectedValue(new Error('Error'));
            teamUserRepositoryService.deleteByTeamIds = jest.fn().mockRejectedValue(new Error('Error'));
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Error message');

            // Act
            await handler.execute(
                new SyncTeamUsersAfterTeamsSyncedCommand('transaction-1', [1, 2], [3, 4, 5], [5, 6, 7, 8]),
            );

            // Assert
            expect(eventBusPublishMethod).toHaveBeenCalledTimes(6);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<TeamUsersSyncFailedEvent>{
                    eventType: TeamUsersSyncFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'Error message',
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

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue([]);

    return queryBus;
}

function mockTeamUserRepositoryService() {
    const teamUserRepositoryService = {} as TeamUserRepositoryService;
    teamUserRepositoryService.createOrUpdateByTeamIdAndUserId = jest.fn();
    teamUserRepositoryService.deleteByTeamId = jest.fn();
    teamUserRepositoryService.deleteByTeamIds = jest.fn();

    return teamUserRepositoryService;
}
