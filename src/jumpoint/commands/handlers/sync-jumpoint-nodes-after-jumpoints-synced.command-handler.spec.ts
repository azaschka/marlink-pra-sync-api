import { EventBus, QueryBus } from '@nestjs/cqrs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpointNodesSyncedEvent, JumpointNodesSyncFailedEvent } from '../../events';
import { JumpointNodeEntity } from '../../repositories/entities';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { SyncJumpointNodesAfterJumpointsSyncedCommand } from '../sync-jumpoint-nodes-after-jumpoints-synced.command';
import { SyncJumpointNodesAfterJumpointsSyncedCommandHandler } from './sync-jumpoint-nodes-after-jumpoints-synced.command-handler';

describe('SyncJumpointNodesAfterJumpointsSyncedCommandHandler', () => {
    let eventBus: EventBus;
    let queryBus: QueryBus;
    let jumpointNodeRepositoryService: JumpointNodeRepositoryService;
    let handler: SyncJumpointNodesAfterJumpointsSyncedCommandHandler;

    beforeEach(() => {
        eventBus = mockEventBus();
        queryBus = mockQueryBus();
        jumpointNodeRepositoryService = mockJumpointNodeRepositoryService();
        handler = new SyncJumpointNodesAfterJumpointsSyncedCommandHandler(
            queryBus,
            eventBus,
            jumpointNodeRepositoryService,
        );
    });

    describe('execute', () => {
        it('should call the query bus and repository service with correct parameters and publish an event', async () => {
            // Arrange
            const queryBusExecuteMethod = jest
                .spyOn(queryBus, 'execute')
                .mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }]) // jumpointId 1
                .mockResolvedValueOnce([{ id: 4 }, { id: 5 }]) // jumpointId 2
                .mockResolvedValueOnce([]) // jumpointId 3
                .mockResolvedValueOnce([{ id: 6 }]); // jumpointId 4
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const jumpointNodeEntityCreateMethod = jest
                .spyOn(JumpointNodeEntity, 'create')
                .mockImplementation((jumpointId: number, id: number) => {
                    return { jumpointId, id } as JumpointNodeEntity;
                });

            const jumpointNodeRepositoryServiceDeleteByJumpointIdsMethod = jest
                .spyOn(jumpointNodeRepositoryService, 'deleteByJumpointIds')
                .mockResolvedValue(Promise.resolve());
            const jumpointNodeRepositoryServiceDeleteByJumpointIdMethod = jest
                .spyOn(jumpointNodeRepositoryService, 'deleteByJumpointId')
                .mockResolvedValue(Promise.resolve());
            const jumpointNodeRepositoryServiceCreateOrUpdateByIdAndJumpointIdMethod = jest
                .spyOn(jumpointNodeRepositoryService, 'createOrUpdateByIdAndJumpointId')
                .mockResolvedValue(Promise.resolve());

            // Act
            await handler.execute(
                new SyncJumpointNodesAfterJumpointsSyncedCommand('transaction-1', [1, 2], [3, 4], [5, 6]),
            );

            // Assert
            // createdJumpointIds: [1, 2]
            // updatedJumpointIds: [3, 4]
            expect(queryBusExecuteMethod).toHaveBeenCalledTimes(4);
            expect(jumpointNodeEntityCreateMethod).toHaveBeenCalledTimes(6);
            expect(jumpointNodeEntityCreateMethod).toHaveBeenNthCalledWith(
                1,
                1,
                1,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
            );
            expect(jumpointNodeEntityCreateMethod).toHaveBeenNthCalledWith(
                2,
                2,
                1,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
            );
            expect(jumpointNodeEntityCreateMethod).toHaveBeenNthCalledWith(
                3,
                3,
                1,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
            );
            expect(jumpointNodeEntityCreateMethod).toHaveBeenNthCalledWith(
                4,
                4,
                2,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
            );
            expect(jumpointNodeEntityCreateMethod).toHaveBeenNthCalledWith(
                5,
                5,
                2,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
            );
            expect(jumpointNodeEntityCreateMethod).toHaveBeenNthCalledWith(
                6,
                6,
                4,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
            );
            expect(jumpointNodeRepositoryServiceDeleteByJumpointIdMethod).toHaveBeenCalledTimes(4);
            expect(jumpointNodeRepositoryServiceDeleteByJumpointIdMethod).toHaveBeenNthCalledWith(1, 1);
            expect(jumpointNodeRepositoryServiceDeleteByJumpointIdMethod).toHaveBeenNthCalledWith(2, 2);
            expect(jumpointNodeRepositoryServiceDeleteByJumpointIdMethod).toHaveBeenNthCalledWith(3, 3);
            expect(jumpointNodeRepositoryServiceDeleteByJumpointIdMethod).toHaveBeenNthCalledWith(4, 4);
            expect(jumpointNodeRepositoryServiceCreateOrUpdateByIdAndJumpointIdMethod).toHaveBeenCalledTimes(4);
            expect(jumpointNodeRepositoryServiceCreateOrUpdateByIdAndJumpointIdMethod).toHaveBeenNthCalledWith(1, [
                { jumpointId: 1, id: 1 },
                { jumpointId: 2, id: 1 },
                { jumpointId: 3, id: 1 },
            ]);
            expect(jumpointNodeRepositoryServiceCreateOrUpdateByIdAndJumpointIdMethod).toHaveBeenNthCalledWith(2, [
                { jumpointId: 4, id: 2 },
                { jumpointId: 5, id: 2 },
            ]);
            expect(jumpointNodeRepositoryServiceCreateOrUpdateByIdAndJumpointIdMethod).toHaveBeenNthCalledWith(3, []);
            expect(jumpointNodeRepositoryServiceCreateOrUpdateByIdAndJumpointIdMethod).toHaveBeenNthCalledWith(4, [
                { jumpointId: 6, id: 4 },
            ]);
            expect(eventBusPublishMethod).toHaveBeenCalledTimes(3);
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining(<JumpointNodesSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: JumpointNodesSyncedEvent.EVENT_TYPE,
                    payload: {
                        jumpointNodes: [
                            {
                                jumpointId: 1,
                                id: 1,
                            },
                            {
                                jumpointId: 2,
                                id: 1,
                            },
                            {
                                jumpointId: 3,
                                id: 1,
                            },
                        ],
                    },
                }),
            );
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining(<JumpointNodesSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: JumpointNodesSyncedEvent.EVENT_TYPE,
                    payload: {
                        jumpointNodes: [
                            {
                                jumpointId: 4,
                                id: 2,
                            },
                            {
                                jumpointId: 5,
                                id: 2,
                            },
                        ],
                    },
                }),
            );
            expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                3,
                expect.objectContaining(<JumpointNodesSyncedEvent>{
                    transactionId: 'transaction-1',
                    eventType: JumpointNodesSyncedEvent.EVENT_TYPE,
                    payload: {
                        jumpointNodes: [
                            {
                                jumpointId: 6,
                                id: 4,
                            },
                        ],
                    },
                }),
            );

            // deletedJumpointIds: [5, 6]
            expect(jumpointNodeRepositoryServiceDeleteByJumpointIdsMethod).toHaveBeenCalledTimes(1);
            expect(jumpointNodeRepositoryServiceDeleteByJumpointIdsMethod).toHaveBeenCalledWith([5, 6]);
        });

        it('should publish an event and not throw error when failure occurs', async () => {
            // Arrange
            queryBus.execute = jest.fn().mockRejectedValue(new Error('Error'));
            jumpointNodeRepositoryService.deleteByJumpointIds = jest.fn().mockRejectedValue(new Error('Error'));
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Error message');

            // Act
            await handler.execute(
                new SyncJumpointNodesAfterJumpointsSyncedCommand('transaction-1', [1, 2], [3, 4, 5], [5, 6, 7, 8]),
            );

            // Assert
            expect(eventBusPublishMethod).toHaveBeenCalledTimes(6);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<JumpointNodesSyncFailedEvent>{
                    eventType: JumpointNodesSyncFailedEvent.EVENT_TYPE,
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

function mockJumpointNodeRepositoryService() {
    const jumpointNodeRepositoryService = {} as JumpointNodeRepositoryService;
    jumpointNodeRepositoryService.createOrUpdateByIdAndJumpointId = jest.fn();
    jumpointNodeRepositoryService.deleteByJumpointId = jest.fn();
    jumpointNodeRepositoryService.deleteByJumpointIds = jest.fn();

    return jumpointNodeRepositoryService;
}
