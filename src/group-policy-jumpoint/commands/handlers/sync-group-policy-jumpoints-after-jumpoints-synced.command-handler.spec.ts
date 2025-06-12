import { EventBus, QueryBus } from '@nestjs/cqrs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyJumpointsSyncedEvent, GroupPolicyJumpointsSyncFailedEvent } from '../../events';
import { GroupPolicyJumpointEntity } from '../../repositories/entities';
import { GroupPolicyJumpointRepositoryService } from '../../repositories/services/group-policy-jumpoint-repository.service';
import { SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommand } from '../sync-group-policy-jumpoints-after-group-policies-synced.command';
import { SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommandHandler } from './sync-group-policy-jumpoints-after-jumpoints-synced.command-handler';

describe('SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommandHandler', () => {
    let eventBus: EventBus;
    let queryBus: QueryBus;
    let groupPolicyJumpointRepositoryService: GroupPolicyJumpointRepositoryService;
    let handler: SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommandHandler;

    beforeEach(() => {
        eventBus = mockEventBus();
        queryBus = mockQueryBus();
        groupPolicyJumpointRepositoryService = mockGroupPolicyJumpointRepositoryService();
        handler = new SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommandHandler(
            queryBus,
            eventBus,
            groupPolicyJumpointRepositoryService,
        );
    });

    describe('execute', () => {
        it('should call the query bus and repository service with correct parameters and publish an event', async () => {
            // Arrange
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce([{ jumpointId: 1 }, { jumpointId: 2 }, { jumpointId: 3 }]) // groupPolicyId 1
                .mockResolvedValueOnce([{ jumpointId: 4 }, { jumpointId: 5 }]) // groupPolicyId 2
                .mockResolvedValueOnce([]) // groupPolicyId 3
                .mockResolvedValueOnce([{ jumpointId: 6 }]); // groupPolicyId 4
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const groupPolicyJumpointEntityCreateMethod = jest
                .spyOn(GroupPolicyJumpointEntity, 'create')
                .mockImplementation((groupPolicyId: number, jumpointId: number) => {
                    return { groupPolicyId, jumpointId } as GroupPolicyJumpointEntity;
                });

            const groupPolicyJumpointRepositoryServiceDeleteByGroupPolicyIdsMethod = jest
                .spyOn(groupPolicyJumpointRepositoryService, 'deleteByGroupPolicyIds')
                .mockResolvedValue(Promise.resolve());
            const groupPolicyJumpointRepositoryServiceDeleteByGroupPolicyIdMethod = jest
                .spyOn(groupPolicyJumpointRepositoryService, 'deleteByGroupPolicyId')
                .mockResolvedValue(Promise.resolve());
            const groupPolicyJumpointRepositoryServiceCreateOrUpdateByGroupPolicyIdAndJumpointIdMethod = jest
                .spyOn(groupPolicyJumpointRepositoryService, 'createOrUpdateByGroupPolicyIdAndJumpointId')
                .mockResolvedValue(Promise.resolve());

            // Act
            await handler.execute(
                new SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommand('transaction-1', [1, 2], [3, 4], [5, 6]),
            );

            // Assert
            // createdGroupPolicyIds: [1, 2]
            // updatedGroupPolicyIds: [3, 4]
            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(4);
            expect(groupPolicyJumpointEntityCreateMethod).toHaveBeenCalledTimes(6);
            expect(groupPolicyJumpointEntityCreateMethod).toHaveBeenNthCalledWith(1, 1, 1);
            expect(groupPolicyJumpointEntityCreateMethod).toHaveBeenNthCalledWith(2, 1, 2);
            expect(groupPolicyJumpointEntityCreateMethod).toHaveBeenNthCalledWith(3, 1, 3);
            expect(groupPolicyJumpointEntityCreateMethod).toHaveBeenNthCalledWith(4, 2, 4);
            expect(groupPolicyJumpointEntityCreateMethod).toHaveBeenNthCalledWith(5, 2, 5);
            expect(groupPolicyJumpointEntityCreateMethod).toHaveBeenNthCalledWith(6, 4, 6);
            expect(groupPolicyJumpointRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenCalledTimes(4);
            expect(groupPolicyJumpointRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(1, 1);
            expect(groupPolicyJumpointRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(2, 2);
            expect(groupPolicyJumpointRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(3, 3);
            expect(groupPolicyJumpointRepositoryServiceDeleteByGroupPolicyIdMethod).toHaveBeenNthCalledWith(4, 4);
            expect(
                groupPolicyJumpointRepositoryServiceCreateOrUpdateByGroupPolicyIdAndJumpointIdMethod,
            ).toHaveBeenCalledTimes(4);
            expect(
                groupPolicyJumpointRepositoryServiceCreateOrUpdateByGroupPolicyIdAndJumpointIdMethod,
            ).toHaveBeenNthCalledWith(1, [
                { groupPolicyId: 1, jumpointId: 1 },
                { groupPolicyId: 1, jumpointId: 2 },
                { groupPolicyId: 1, jumpointId: 3 },
            ]);
            expect(
                groupPolicyJumpointRepositoryServiceCreateOrUpdateByGroupPolicyIdAndJumpointIdMethod,
            ).toHaveBeenNthCalledWith(2, [
                { groupPolicyId: 2, jumpointId: 4 },
                { groupPolicyId: 2, jumpointId: 5 },
            ]);
            expect(
                groupPolicyJumpointRepositoryServiceCreateOrUpdateByGroupPolicyIdAndJumpointIdMethod,
            ).toHaveBeenNthCalledWith(3, []);
            expect(
                groupPolicyJumpointRepositoryServiceCreateOrUpdateByGroupPolicyIdAndJumpointIdMethod,
            ).toHaveBeenNthCalledWith(4, [{ groupPolicyId: 4, jumpointId: 6 }]);
            expect(eventBusPublishMethod).toHaveBeenCalledTimes(4);
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining(<GroupPolicyJumpointsSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyJumpointsSyncedEvent.EVENT_TYPE,
                    payload: {
                        groupPolicyJumpoints: {
                            groupPolicyId: 1,
                            jumpointIds: [1, 2, 3],
                        },
                    },
                }),
            );
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining(<GroupPolicyJumpointsSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyJumpointsSyncedEvent.EVENT_TYPE,
                    payload: {
                        groupPolicyJumpoints: {
                            groupPolicyId: 2,
                            jumpointIds: [4, 5],
                        },
                    },
                }),
            );
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                3,
                expect.objectContaining(<GroupPolicyJumpointsSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyJumpointsSyncedEvent.EVENT_TYPE,
                    payload: {
                        groupPolicyJumpoints: {
                            groupPolicyId: 3,
                            jumpointIds: [],
                        },
                    },
                }),
            );
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                4,
                expect.objectContaining(<GroupPolicyJumpointsSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyJumpointsSyncedEvent.EVENT_TYPE,
                    payload: {
                        groupPolicyJumpoints: {
                            groupPolicyId: 4,
                            jumpointIds: [6],
                        },
                    },
                }),
            );

            // deletedGroupPolicyIds: [5, 6]
            expect(groupPolicyJumpointRepositoryServiceDeleteByGroupPolicyIdsMethod).toHaveBeenCalledTimes(1);
            expect(groupPolicyJumpointRepositoryServiceDeleteByGroupPolicyIdsMethod).toHaveBeenCalledWith([5, 6]);
        });

        it('should publish an event and not throw error when failure occurs', async () => {
            // Arrange
            queryBus.execute = jest.fn().mockRejectedValue(new Error('Error'));
            groupPolicyJumpointRepositoryService.deleteByGroupPolicyIds = jest
                .fn()
                .mockRejectedValue(new Error('Error'));
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Error message');

            // Act
            await handler.execute(
                new SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommand(
                    'transaction-1',
                    [1, 2],
                    [3, 4, 5],
                    [5, 6, 7, 8],
                ),
            );

            // Assert
            expect(eventBusPublishMethod).toHaveBeenCalledTimes(6);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<GroupPolicyJumpointsSyncFailedEvent>{
                    eventType: GroupPolicyJumpointsSyncFailedEvent.EVENT_TYPE,
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

function mockGroupPolicyJumpointRepositoryService() {
    const groupPolicyJumpointRepositoryService = {} as GroupPolicyJumpointRepositoryService;
    groupPolicyJumpointRepositoryService.createOrUpdateByGroupPolicyIdAndJumpointId = jest.fn();
    groupPolicyJumpointRepositoryService.deleteByGroupPolicyId = jest.fn();
    groupPolicyJumpointRepositoryService.deleteByGroupPolicyIds = jest.fn();

    return groupPolicyJumpointRepositoryService;
}
