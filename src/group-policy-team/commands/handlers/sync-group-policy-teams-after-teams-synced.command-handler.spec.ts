import { EventBus, QueryBus } from '@nestjs/cqrs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyTeamsSyncedEvent, GroupPolicyTeamsSyncFailedEvent } from '../../events';
import { GroupPolicyTeamEntity } from '../../repositories/entities';
import { GroupPolicyTeamRepositoryService } from '../../repositories/services/group-policy-team-repository.service';
import { SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommand } from '../sync-group-policy-teams-after-group-policies-synced.command';
import { SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-teams-after-teams-synced.command-handler';

describe('SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommandHandler', () => {
    let eventBus: EventBus;
    let queryBus: QueryBus;
    let groupPolicyTeamRepositoryService: GroupPolicyTeamRepositoryService;
    let handler: SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommandHandler;

    beforeEach(() => {
        eventBus = mockEventBus();
        queryBus = mockQueryBus();
        groupPolicyTeamRepositoryService = mockGroupPolicyTeamRepositoryService();
        handler = new SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommandHandler(
            queryBus,
            eventBus,
            groupPolicyTeamRepositoryService,
        );
    });

    describe('execute', () => {
        it('should call the query bus and repository service with correct parameters and publish an event', async () => {
            // Arrange
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce([{ teamId: 1 }, { teamId: 2 }, { teamId: 3 }]) // groupPolicyId 1
                .mockResolvedValueOnce([{ teamId: 4 }, { teamId: 5 }]) // groupPolicyId 2
                .mockResolvedValueOnce([]) // groupPolicyId 3
                .mockResolvedValueOnce([{ teamId: 6 }]); // groupPolicyId 4
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const groupPolicyTeamEntityCreateMethod = jest
                .spyOn(GroupPolicyTeamEntity, 'create')
                .mockImplementation((groupPolicyId: number, teamId: number) => {
                    return { groupPolicyId, teamId } as GroupPolicyTeamEntity;
                });

            const groupPolicyTeamRepositoryServiceDeleteByGroupPolicyIdsMethod = jest
                .spyOn(groupPolicyTeamRepositoryService, 'deleteByGroupPolicyIds')
                .mockResolvedValue(Promise.resolve());
            const groupPolicyTeamRepositoryServiceDeleteByGroupPolicyIdMethod = jest
                .spyOn(groupPolicyTeamRepositoryService, 'deleteByGroupPolicyId')
                .mockResolvedValue(Promise.resolve());
            const groupPolicyTeamRepositoryServiceCreateOrUpdateByGroupPolicyIdAndTeamIdMethod = jest
                .spyOn(groupPolicyTeamRepositoryService, 'createOrUpdateByGroupPolicyIdAndTeamId')
                .mockResolvedValue(Promise.resolve());

            // Act
            await handler.execute(
                new SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommand('transaction-1', [1, 2], [3, 4], [5, 6]),
            );

            // Assert
            // createdGroupPolicyIds: [1, 2]
            // updatedGroupPolicyIds: [3, 4]
            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(4);
            expect(groupPolicyTeamEntityCreateMethod).toHaveBeenCalledTimes(6);
            expect(groupPolicyTeamEntityCreateMethod).toHaveBeenNthCalledWith(1, 1, 1, undefined);
            expect(groupPolicyTeamEntityCreateMethod).toHaveBeenNthCalledWith(2, 1, 2, undefined);
            expect(groupPolicyTeamEntityCreateMethod).toHaveBeenNthCalledWith(3, 1, 3, undefined);
            expect(groupPolicyTeamEntityCreateMethod).toHaveBeenNthCalledWith(4, 2, 4, undefined);
            expect(groupPolicyTeamEntityCreateMethod).toHaveBeenNthCalledWith(5, 2, 5, undefined);
            expect(groupPolicyTeamEntityCreateMethod).toHaveBeenNthCalledWith(6, 4, 6, undefined);
            expect(groupPolicyTeamRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenCalledTimes(4);
            expect(groupPolicyTeamRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(1, 1);
            expect(groupPolicyTeamRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(2, 2);
            expect(groupPolicyTeamRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(3, 3);
            expect(groupPolicyTeamRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(4, 4);
            expect(groupPolicyTeamRepositoryServiceCreateOrUpdateByGroupPolicyIdAndTeamIdMethod).toHaveBeenCalledTimes(
                4,
            );
            expect(
                groupPolicyTeamRepositoryServiceCreateOrUpdateByGroupPolicyIdAndTeamIdMethod,
            ).toHaveBeenNthCalledWith(1, [
                { groupPolicyId: 1, teamId: 1 },
                { groupPolicyId: 1, teamId: 2 },
                { groupPolicyId: 1, teamId: 3 },
            ]);
            expect(
                groupPolicyTeamRepositoryServiceCreateOrUpdateByGroupPolicyIdAndTeamIdMethod,
            ).toHaveBeenNthCalledWith(2, [
                { groupPolicyId: 2, teamId: 4 },
                { groupPolicyId: 2, teamId: 5 },
            ]);
            expect(
                groupPolicyTeamRepositoryServiceCreateOrUpdateByGroupPolicyIdAndTeamIdMethod,
            ).toHaveBeenNthCalledWith(3, []);
            expect(
                groupPolicyTeamRepositoryServiceCreateOrUpdateByGroupPolicyIdAndTeamIdMethod,
            ).toHaveBeenNthCalledWith(4, [{ groupPolicyId: 4, teamId: 6 }]);
            expect(eventBusPublishMethod).toHaveBeenCalledTimes(4);
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining(<GroupPolicyTeamsSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyTeamsSyncedEvent.EVENT_TYPE,
                    payload: {
                        groupPolicyTeams: [
                            {
                                groupPolicyId: 1,
                                teamId: 1,
                            },
                            {
                                groupPolicyId: 1,
                                teamId: 2,
                            },
                            {
                                groupPolicyId: 1,
                                teamId: 3,
                            },
                        ],
                    },
                }),
            );
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining(<GroupPolicyTeamsSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyTeamsSyncedEvent.EVENT_TYPE,
                    payload: {
                        groupPolicyTeams: [
                            {
                                groupPolicyId: 2,
                                teamId: 4,
                            },
                            {
                                groupPolicyId: 2,
                                teamId: 5,
                            },
                        ],
                    },
                }),
            );
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                3,
                expect.objectContaining(<GroupPolicyTeamsSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyTeamsSyncedEvent.EVENT_TYPE,
                    payload: {
                        groupPolicyTeams: [],
                    },
                }),
            );
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                4,
                expect.objectContaining(<GroupPolicyTeamsSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyTeamsSyncedEvent.EVENT_TYPE,
                    payload: {
                        groupPolicyTeams: [
                            {
                                groupPolicyId: 4,
                                teamId: 6,
                            },
                        ],
                    },
                }),
            );

            // deletedGroupPolicyIds: [5, 6]
            expect(groupPolicyTeamRepositoryServiceDeleteByGroupPolicyIdsMethod).toHaveBeenCalledTimes(1);
            expect(groupPolicyTeamRepositoryServiceDeleteByGroupPolicyIdsMethod).toHaveBeenCalledWith([5, 6]);
        });

        it('should publish an event and not throw error when failure occurs', async () => {
            // Arrange
            queryBus.execute = jest.fn().mockRejectedValue(new Error('Error'));
            groupPolicyTeamRepositoryService.deleteByGroupPolicyIds = jest.fn().mockRejectedValue(new Error('Error'));
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Error message');

            // Act
            await handler.execute(
                new SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommand(
                    'transaction-1',
                    [1, 2],
                    [3, 4, 5],
                    [5, 6, 7, 8],
                ),
            );

            // Assert
            expect(eventBusPublishMethod).toHaveBeenCalledTimes(6);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<GroupPolicyTeamsSyncFailedEvent>{
                    eventType: GroupPolicyTeamsSyncFailedEvent.EVENT_TYPE,
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

function mockGroupPolicyTeamRepositoryService() {
    const groupPolicyTeamRepositoryService = {} as GroupPolicyTeamRepositoryService;
    groupPolicyTeamRepositoryService.createOrUpdateByGroupPolicyIdAndTeamId = jest.fn();
    groupPolicyTeamRepositoryService.deleteByGroupPolicyId = jest.fn();
    groupPolicyTeamRepositoryService.deleteByGroupPolicyIds = jest.fn();

    return groupPolicyTeamRepositoryService;
}
