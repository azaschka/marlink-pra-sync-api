import { EventBus, QueryBus } from '@nestjs/cqrs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyJumpGroupsSyncedEvent, GroupPolicyJumpGroupsSyncFailedEvent } from '../../events';
import { GroupPolicyJumpGroupEntity } from '../../repositories/entities';
import { GroupPolicyJumpGroupRepositoryService } from '../../repositories/services/group-policy-jump-group-repository.service';
import { SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommand } from '../sync-group-policy-jump-groups-after-group-policies-synced.command';
import { SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-jump-groups-after-jump-groups-synced.command-handler';

describe('SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommandHandler', () => {
    let eventBus: EventBus;
    let queryBus: QueryBus;
    let groupPolicyJumpGroupRepositoryService: GroupPolicyJumpGroupRepositoryService;
    let handler: SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommandHandler;

    beforeEach(() => {
        eventBus = mockEventBus();
        queryBus = mockQueryBus();
        groupPolicyJumpGroupRepositoryService = mockGroupPolicyJumpGroupRepositoryService();
        handler = new SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommandHandler(
            queryBus,
            eventBus,
            groupPolicyJumpGroupRepositoryService,
        );
    });

    describe('execute', () => {
        it('should call the query bus and repository service with correct parameters and publish an event', async () => {
            // Arrange
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce([{ jumpGroupId: 1 }, { jumpGroupId: 2 }, { jumpGroupId: 3 }]) // groupPolicyId 1
                .mockResolvedValueOnce([{ jumpGroupId: 4 }, { jumpGroupId: 5 }]) // groupPolicyId 2
                .mockResolvedValueOnce([]) // groupPolicyId 3
                .mockResolvedValueOnce([{ jumpGroupId: 6 }]); // groupPolicyId 4
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const groupPolicyJumpGroupEntityCreateMethod = jest
                .spyOn(GroupPolicyJumpGroupEntity, 'create')
                .mockImplementation((groupPolicyId: number, jumpGroupId: number) => {
                    return { groupPolicyId, jumpGroupId } as GroupPolicyJumpGroupEntity;
                });

            const groupPolicyJumpGroupRepositoryServiceDeleteByGroupPolicyIdsMethod = jest
                .spyOn(groupPolicyJumpGroupRepositoryService, 'deleteByGroupPolicyIds')
                .mockResolvedValue(Promise.resolve());
            const groupPolicyJumpGroupRepositoryServiceDeleteByGroupPolicyIdMethod = jest
                .spyOn(groupPolicyJumpGroupRepositoryService, 'deleteByGroupPolicyId')
                .mockResolvedValue(Promise.resolve());
            const groupPolicyJumpGroupRepositoryServiceCreateOrUpdateByGroupPolicyIdAndJumpGroupIdMethod = jest
                .spyOn(groupPolicyJumpGroupRepositoryService, 'createOrUpdateByGroupPolicyIdAndJumpGroupId')
                .mockResolvedValue(Promise.resolve());

            // Act
            await handler.execute(
                new SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommand(
                    'transaction-1',
                    123,
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ),
            );

            // Assert
            // createdGroupPolicyIds: [1, 2]
            // updatedGroupPolicyIds: [3, 4]
            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(4);
            expect(groupPolicyJumpGroupEntityCreateMethod).toHaveBeenCalledTimes(6);
            expect(groupPolicyJumpGroupEntityCreateMethod).toHaveBeenNthCalledWith(1, 1, 1, undefined, undefined);
            expect(groupPolicyJumpGroupEntityCreateMethod).toHaveBeenNthCalledWith(2, 1, 2, undefined, undefined);
            expect(groupPolicyJumpGroupEntityCreateMethod).toHaveBeenNthCalledWith(3, 1, 3, undefined, undefined);
            expect(groupPolicyJumpGroupEntityCreateMethod).toHaveBeenNthCalledWith(4, 2, 4, undefined, undefined);
            expect(groupPolicyJumpGroupEntityCreateMethod).toHaveBeenNthCalledWith(5, 2, 5, undefined, undefined);
            expect(groupPolicyJumpGroupEntityCreateMethod).toHaveBeenNthCalledWith(6, 4, 6, undefined, undefined);
            expect(groupPolicyJumpGroupRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenCalledTimes(4);
            expect(groupPolicyJumpGroupRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(1, 123, 1);
            expect(groupPolicyJumpGroupRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(2, 123, 2);
            expect(groupPolicyJumpGroupRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(3, 123, 3);
            expect(groupPolicyJumpGroupRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(4, 123, 4);
            expect(
                groupPolicyJumpGroupRepositoryServiceCreateOrUpdateByGroupPolicyIdAndJumpGroupIdMethod,
            ).toHaveBeenCalledTimes(4);
            expect(
                groupPolicyJumpGroupRepositoryServiceCreateOrUpdateByGroupPolicyIdAndJumpGroupIdMethod,
            ).toHaveBeenNthCalledWith(1, 123, [
                { groupPolicyId: 1, jumpGroupId: 1 },
                { groupPolicyId: 1, jumpGroupId: 2 },
                { groupPolicyId: 1, jumpGroupId: 3 },
            ]);
            expect(
                groupPolicyJumpGroupRepositoryServiceCreateOrUpdateByGroupPolicyIdAndJumpGroupIdMethod,
            ).toHaveBeenNthCalledWith(2, 123, [
                { groupPolicyId: 2, jumpGroupId: 4 },
                { groupPolicyId: 2, jumpGroupId: 5 },
            ]);
            expect(
                groupPolicyJumpGroupRepositoryServiceCreateOrUpdateByGroupPolicyIdAndJumpGroupIdMethod,
            ).toHaveBeenNthCalledWith(3, 123, []);
            expect(
                groupPolicyJumpGroupRepositoryServiceCreateOrUpdateByGroupPolicyIdAndJumpGroupIdMethod,
            ).toHaveBeenNthCalledWith(4, 123, [{ groupPolicyId: 4, jumpGroupId: 6 }]);
            expect(eventBusPublishMethod).toHaveBeenCalledTimes(3);
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining(<GroupPolicyJumpGroupsSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyJumpGroupsSyncedEvent.EVENT_TYPE,
                    payload: {
                        groupPolicyJumpGroups: [
                            {
                                groupPolicyId: 1,
                                jumpGroupId: 1,
                            },
                            {
                                groupPolicyId: 1,
                                jumpGroupId: 2,
                            },
                            {
                                groupPolicyId: 1,
                                jumpGroupId: 3,
                            },
                        ],
                        tenantId: 123,
                    },
                }),
            );
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining(<GroupPolicyJumpGroupsSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyJumpGroupsSyncedEvent.EVENT_TYPE,
                    payload: {
                        groupPolicyJumpGroups: [
                            {
                                groupPolicyId: 2,
                                jumpGroupId: 4,
                            },
                            {
                                groupPolicyId: 2,
                                jumpGroupId: 5,
                            },
                        ],
                        tenantId: 123,
                    },
                }),
            );
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                3,
                expect.objectContaining(<GroupPolicyJumpGroupsSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyJumpGroupsSyncedEvent.EVENT_TYPE,
                    payload: {
                        groupPolicyJumpGroups: [
                            {
                                groupPolicyId: 4,
                                jumpGroupId: 6,
                            },
                        ],
                        tenantId: 123,
                    },
                }),
            );

            // deletedGroupPolicyIds: [5, 6]
            expect(groupPolicyJumpGroupRepositoryServiceDeleteByGroupPolicyIdsMethod).toHaveBeenCalledTimes(1);
            expect(groupPolicyJumpGroupRepositoryServiceDeleteByGroupPolicyIdsMethod).toHaveBeenCalledWith(123, [5, 6]);
        });

        it('should publish an event and not throw error when failure occurs', async () => {
            // Arrange
            queryBus.execute = jest.fn().mockRejectedValue(new Error('Error'));
            groupPolicyJumpGroupRepositoryService.deleteByGroupPolicyIds = jest
                .fn()
                .mockRejectedValue(new Error('Error'));
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Error message');

            // Act
            await handler.execute(
                new SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommand(
                    'transaction-1',
                    123,
                    [1, 2],
                    [3, 4, 5],
                    [5, 6, 7, 8],
                ),
            );

            // Assert
            expect(eventBusPublishMethod).toHaveBeenCalledTimes(6);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<GroupPolicyJumpGroupsSyncFailedEvent>{
                    eventType: GroupPolicyJumpGroupsSyncFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'Error message',
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

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue([]);

    return queryBus;
}

function mockGroupPolicyJumpGroupRepositoryService() {
    const groupPolicyJumpGroupRepositoryService = {} as GroupPolicyJumpGroupRepositoryService;
    groupPolicyJumpGroupRepositoryService.createOrUpdateByGroupPolicyIdAndJumpGroupId = jest.fn();
    groupPolicyJumpGroupRepositoryService.deleteByGroupPolicyId = jest.fn();
    groupPolicyJumpGroupRepositoryService.deleteByGroupPolicyIds = jest.fn();

    return groupPolicyJumpGroupRepositoryService;
}
