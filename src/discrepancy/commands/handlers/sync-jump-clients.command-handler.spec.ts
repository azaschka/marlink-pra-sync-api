import { EventBus, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { JumpClientRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import { JumpClientsSyncedEvent, JumpClientsSyncFailedEvent } from '../../../jump-client/events';
import { JumpClientEntity } from '../../../jump-client/repositories/entities';
import { JumpClientRepositoryService } from '../../../jump-client/repositories/services/jump-client-repository.service';
import { JumpGroupEntity } from '../../../jump-group/repositories/entities';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { SyncJumpClientsCommand } from '../sync-jump-clients.command';
import { SyncJumpClientsCommandHandler } from './sync-jump-clients.command-handler';

abstract class TestHelper {
    public static generateMockedJumpClientRetrievedDtoOutputs(ids: number[]): JumpClientRetrievedDtoOutput[] {
        return ids.map((id) => ({
            id,
            jumpGroupId: id,
            name: `jump-client-${id}`,
        }));
    }

    public static generateMockedJumpClientEntities(ids: number[]): JumpClientEntity[] {
        return ids.map((id) => ({
            id,
            jumpGroupId: id,
            name: `jump-client-${id}`,
            lastSyncDate: new Date('2025-01-01T00:00:00Z'),
            jumpGroup: {} as JumpGroupEntity,
        }));
    }
}

describe('SyncJumpClientsCommandHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let jumpClientRepositoryService: JumpClientRepositoryService;
    let handler: SyncJumpClientsCommandHandler;

    beforeEach(() => {
        mockJumpClientEntityCreateMethod();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        jumpClientRepositoryService = mockJumpClientRepositoryService();
        handler = new SyncJumpClientsCommandHandler(appConfigService, queryBus, eventBus, jumpClientRepositoryService);
    });

    describe('execute', () => {
        it('should publish an event and throw an error when an error occurs', async () => {
            const error = new Error('Test error');
            const eventBusPublish = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Test error');

            queryBus.execute = jest.fn().mockRejectedValue(error);

            await expect(handler.execute(new SyncJumpClientsCommand('transaction-1', 123))).rejects.toThrow(error);

            expect(eventBusPublish).toHaveBeenCalledWith(
                expect.objectContaining(<JumpClientsSyncFailedEvent>{
                    eventType: JumpClientsSyncFailedEvent.EVENT_TYPE,
                    transactionId: 'transaction-1',
                    payload: {
                        errorMessage: 'Test error',
                        tenantId: 123,
                    },
                }),
            );
        });

        it.each([
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpClientRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpClientRetrievedDtoOutputs([3, 4]))
                    .mockResolvedValue(TestHelper.generateMockedJumpClientRetrievedDtoOutputs([3, 4])), // BT return repeating data when pagination limit is exceeded
                jumpClientRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpClientEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpClientEntities([7, 8]))
                    .mockResolvedValue(TestHelper.generateMockedJumpClientEntities([])),
                jumpClientRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedJumpClientEntities([1, 3])),
                expectedJumpClientRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3, 4],
                    },
                ],
                expectedJumpClientRepositoryServiceCreateOrUpdateByIdCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedJumpClientEntities([2])[0],
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedJumpClientEntities([1])[0],
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedJumpClientEntities([4])[0],
                    },
                    {
                        iter: 4,
                        entity: TestHelper.generateMockedJumpClientEntities([3])[0],
                    },
                ],
                expectedJumpClientRepositoryServiceDeleteByIdsCall: [
                    {
                        iter: 1,
                        ids: [5, 6],
                    },
                    {
                        iter: 2,
                        ids: [7, 8],
                    },
                ],
                expectedResult: {
                    createdJumpClientIds: [2, 4],
                    updatedJumpClientIds: [1, 3],
                    deletedJumpClientIds: [5, 6, 7, 8],
                },
            },
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpClientRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValue(TestHelper.generateMockedJumpClientRetrievedDtoOutputs([3])),
                jumpClientRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpClientEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpClientEntities([7])),
                jumpClientRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedJumpClientEntities([1, 3])),
                expectedJumpClientRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3],
                    },
                ],
                expectedJumpClientRepositoryServiceCreateOrUpdateByIdCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedJumpClientEntities([2])[0],
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedJumpClientEntities([1])[0],
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedJumpClientEntities([3])[0],
                    },
                ],
                expectedJumpClientRepositoryServiceDeleteByIdsCall: [
                    {
                        iter: 1,
                        ids: [5, 6],
                    },
                    {
                        iter: 2,
                        ids: [7],
                    },
                ],
                expectedResult: {
                    createdJumpClientIds: [2],
                    updatedJumpClientIds: [1, 3],
                    deletedJumpClientIds: [5, 6, 7],
                },
            },
        ])(
            'should return, call method and publish event as expected',
            async ({
                queryBusExecuteResolvedValue,
                jumpClientRepositoryFindByLastSyncDateBeforeResolvedValue,
                jumpClientRepositoryServiceFindByIdsResolvedValue,
                expectedJumpClientRepositoryServiceFindByIdsCall,
                expectedJumpClientRepositoryServiceCreateOrUpdateByIdCall,
                expectedJumpClientRepositoryServiceDeleteByIdsCall,
                expectedResult,
            }) => {
                queryBus.execute = queryBusExecuteResolvedValue;
                jumpClientRepositoryService.findByLastSyncDateBefore =
                    jumpClientRepositoryFindByLastSyncDateBeforeResolvedValue;
                const jumpClientRepositoryServiceFindByIds = jest
                    .spyOn(jumpClientRepositoryService, 'findByIds')
                    .mockImplementation(jumpClientRepositoryServiceFindByIdsResolvedValue);
                const jumpClientRepositoryServiceCreateOrUpdateById = jest.spyOn(
                    jumpClientRepositoryService,
                    'createOrUpdateById',
                );
                const jumpClientRepositoryServiceDeleteByIds = jest.spyOn(jumpClientRepositoryService, 'deleteByIds');
                const eventBusPublish = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(new SyncJumpClientsCommand('transaction-1', 123));

                expect(jumpClientRepositoryServiceFindByIds).toHaveBeenCalledTimes(
                    expectedJumpClientRepositoryServiceFindByIdsCall.length,
                );
                for (const item of expectedJumpClientRepositoryServiceFindByIdsCall) {
                    expect(jumpClientRepositoryServiceFindByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(jumpClientRepositoryServiceCreateOrUpdateById).toHaveBeenCalledTimes(
                    expectedJumpClientRepositoryServiceCreateOrUpdateByIdCall.length,
                );
                for (const item of expectedJumpClientRepositoryServiceCreateOrUpdateByIdCall) {
                    expect(jumpClientRepositoryServiceCreateOrUpdateById).toHaveBeenNthCalledWith(
                        item.iter,
                        123,
                        item.entity,
                    );
                }

                expect(jumpClientRepositoryServiceDeleteByIds).toHaveBeenCalledTimes(
                    expectedJumpClientRepositoryServiceDeleteByIdsCall.length,
                );
                for (const item of expectedJumpClientRepositoryServiceDeleteByIdsCall) {
                    expect(jumpClientRepositoryServiceDeleteByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(result).toEqual(expectedResult);

                expect(eventBusPublish).toHaveBeenCalledWith(
                    expect.objectContaining(<JumpClientsSyncedEvent>{
                        eventType: JumpClientsSyncedEvent.EVENT_TYPE,
                        transactionId: 'transaction-1',
                        payload: {
                            createdJumpClientIds: expectedResult.createdJumpClientIds,
                            updatedJumpClientIds: expectedResult.updatedJumpClientIds,
                            deletedJumpClientIds: expectedResult.deletedJumpClientIds,
                            tenantId: 123,
                        },
                    }),
                );
            },
        );
    });
});

function mockJumpClientEntityCreateMethod() {
    JumpClientEntity.create = jest.fn().mockImplementation((id: number) => {
        return TestHelper.generateMockedJumpClientEntities([id])[0];
    });
}

function mockAppConfigService(): AppConfigService {
    const service = {
        sync: {
            maxBatchSize: 2,
        },
    } as AppConfigService;

    return service;
}

function mockQueryBus(): QueryBus {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn();

    return queryBus;
}

function mockEventBus(): EventBus {
    const eventBus = {} as EventBus;
    eventBus.publish = jest.fn();

    return eventBus;
}

function mockJumpClientRepositoryService(): JumpClientRepositoryService {
    const service = {} as JumpClientRepositoryService;
    service.findByIds = jest.fn();
    service.createOrUpdateById = jest.fn();
    service.findByLastSyncDateBefore = jest.fn();
    service.deleteByIds = jest.fn();

    return service;
}
