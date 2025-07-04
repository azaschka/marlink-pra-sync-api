import { EventBus, QueryBus } from '@nestjs/cqrs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyMembersSyncedEvent, GroupPolicyMembersSyncFailedEvent } from '../../events';
import { GroupPolicyMemberEntity } from '../../repositories/entities';
import { GroupPolicyMemberRepositoryService } from '../../repositories/services/group-policy-member-repository.service';
import { SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommand } from '../sync-group-policy-members-after-group-policies-synced.command';
import { SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-members-after-members-synced.command-handler';

describe('SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommandHandler', () => {
    let eventBus: EventBus;
    let queryBus: QueryBus;
    let groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService;
    let handler: SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommandHandler;

    beforeEach(() => {
        eventBus = mockEventBus();
        queryBus = mockQueryBus();
        groupPolicyMemberRepositoryService = mockGroupPolicyMemberRepositoryService();
        handler = new SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommandHandler(
            queryBus,
            eventBus,
            groupPolicyMemberRepositoryService,
        );
    });

    describe('execute', () => {
        it('should call the query bus and repository service with correct parameters and publish an event', async () => {
            // Arrange
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce([
                    { id: 1, userId: 1 },
                    { id: 2, userId: 2 },
                    { id: 3, userId: 3 },
                ]) // groupPolicyId 1
                .mockResolvedValueOnce([
                    { id: 4, userId: 4 },
                    { id: 5, userId: 5 },
                ]) // groupPolicyId 2
                .mockResolvedValueOnce([]) // groupPolicyId 3
                .mockResolvedValueOnce([{ id: 6, userId: 6 }]); // groupPolicyId 4
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const groupPolicyMemberEntityCreateMethod = jest
                .spyOn(GroupPolicyMemberEntity, 'create')
                .mockImplementation((groupPolicyId: number, memberId: number) => {
                    return { groupPolicyId, memberId } as GroupPolicyMemberEntity;
                });

            const groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdsMethod = jest
                .spyOn(groupPolicyMemberRepositoryService, 'deleteByGroupPolicyIds')
                .mockResolvedValue(Promise.resolve());
            const groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdMethod = jest
                .spyOn(groupPolicyMemberRepositoryService, 'deleteByGroupPolicyId')
                .mockResolvedValue(Promise.resolve());
            const groupPolicyMemberRepositoryServiceCreateOrUpdateByGroupPolicyIdAndMemberIdMethod = jest
                .spyOn(groupPolicyMemberRepositoryService, 'createOrUpdateByGroupPolicyIdAndMemberId')
                .mockResolvedValue(Promise.resolve());

            // Act
            await handler.execute(
                new SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommand('transaction-1', [1, 2], [3, 4], [5, 6]),
            );

            // Assert
            // createdGroupPolicyIds: [1, 2]
            // updatedGroupPolicyIds: [3, 4]
            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(4);
            expect(groupPolicyMemberEntityCreateMethod).toHaveBeenCalledTimes(6);
            expect(groupPolicyMemberEntityCreateMethod).toHaveBeenNthCalledWith(
                1,
                1,
                1,
                1,
                undefined,
                undefined,
                undefined,
            );
            expect(groupPolicyMemberEntityCreateMethod).toHaveBeenNthCalledWith(
                2,
                1,
                2,
                2,
                undefined,
                undefined,
                undefined,
            );
            expect(groupPolicyMemberEntityCreateMethod).toHaveBeenNthCalledWith(
                3,
                1,
                3,
                3,
                undefined,
                undefined,
                undefined,
            );
            expect(groupPolicyMemberEntityCreateMethod).toHaveBeenNthCalledWith(
                4,
                2,
                4,
                4,
                undefined,
                undefined,
                undefined,
            );
            expect(groupPolicyMemberEntityCreateMethod).toHaveBeenNthCalledWith(
                5,
                2,
                5,
                5,
                undefined,
                undefined,
                undefined,
            );
            expect(groupPolicyMemberEntityCreateMethod).toHaveBeenNthCalledWith(
                6,
                4,
                6,
                6,
                undefined,
                undefined,
                undefined,
            );
            expect(groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenCalledTimes(4);
            expect(groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(1, 1);
            expect(groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(2, 2);
            expect(groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(3, 3);
            expect(groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(4, 4);
            expect(
                groupPolicyMemberRepositoryServiceCreateOrUpdateByGroupPolicyIdAndMemberIdMethod,
            ).toHaveBeenCalledTimes(4);
            expect(
                groupPolicyMemberRepositoryServiceCreateOrUpdateByGroupPolicyIdAndMemberIdMethod,
            ).toHaveBeenNthCalledWith(1, [
                { groupPolicyId: 1, memberId: 1 },
                { groupPolicyId: 1, memberId: 2 },
                { groupPolicyId: 1, memberId: 3 },
            ]);
            expect(
                groupPolicyMemberRepositoryServiceCreateOrUpdateByGroupPolicyIdAndMemberIdMethod,
            ).toHaveBeenNthCalledWith(2, [
                { groupPolicyId: 2, memberId: 4 },
                { groupPolicyId: 2, memberId: 5 },
            ]);
            expect(
                groupPolicyMemberRepositoryServiceCreateOrUpdateByGroupPolicyIdAndMemberIdMethod,
            ).toHaveBeenNthCalledWith(3, []);
            expect(
                groupPolicyMemberRepositoryServiceCreateOrUpdateByGroupPolicyIdAndMemberIdMethod,
            ).toHaveBeenNthCalledWith(4, [{ groupPolicyId: 4, memberId: 6 }]);
            expect(eventBusPublishMethod).toHaveBeenCalledTimes(4);
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining(<GroupPolicyMembersSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyMembersSyncedEvent.EVENT_TYPE,
                    payload: {
                        groupPolicyMembers: [
                            {
                                groupPolicyId: 1,
                                memberId: 1,
                            },
                            {
                                groupPolicyId: 1,
                                memberId: 2,
                            },
                            {
                                groupPolicyId: 1,
                                memberId: 3,
                            },
                        ],
                    },
                }),
            );
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining(<GroupPolicyMembersSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyMembersSyncedEvent.EVENT_TYPE,
                    payload: {
                        groupPolicyMembers: [
                            {
                                groupPolicyId: 2,
                                memberId: 4,
                            },
                            {
                                groupPolicyId: 2,
                                memberId: 5,
                            },
                        ],
                    },
                }),
            );
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                3,
                expect.objectContaining(<GroupPolicyMembersSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyMembersSyncedEvent.EVENT_TYPE,
                    payload: {
                        groupPolicyMembers: [],
                    },
                }),
            );
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                4,
                expect.objectContaining(<GroupPolicyMembersSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyMembersSyncedEvent.EVENT_TYPE,
                    payload: {
                        groupPolicyMembers: [
                            {
                                groupPolicyId: 4,
                                memberId: 6,
                            },
                        ],
                    },
                }),
            );

            // deletedGroupPolicyIds: [5, 6]
            expect(groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdsMethod).toHaveBeenCalledTimes(1);
            expect(groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdsMethod).toHaveBeenCalledWith([5, 6]);
        });

        it('should publish an event and not throw error when failure occurs', async () => {
            // Arrange
            queryBus.execute = jest.fn().mockRejectedValue(new Error('Error'));
            groupPolicyMemberRepositoryService.deleteByGroupPolicyIds = jest.fn().mockRejectedValue(new Error('Error'));
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Error message');

            // Act
            await handler.execute(
                new SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommand(
                    'transaction-1',
                    [1, 2],
                    [3, 4, 5],
                    [5, 6, 7, 8],
                ),
            );

            // Assert
            expect(eventBusPublishMethod).toHaveBeenCalledTimes(6);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<GroupPolicyMembersSyncFailedEvent>{
                    eventType: GroupPolicyMembersSyncFailedEvent.EVENT_TYPE,
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

function mockGroupPolicyMemberRepositoryService() {
    const groupPolicyMemberRepositoryService = {} as GroupPolicyMemberRepositoryService;
    groupPolicyMemberRepositoryService.createOrUpdateByGroupPolicyIdAndMemberId = jest.fn();
    groupPolicyMemberRepositoryService.deleteByGroupPolicyId = jest.fn();
    groupPolicyMemberRepositoryService.deleteByGroupPolicyIds = jest.fn();

    return groupPolicyMemberRepositoryService;
}
