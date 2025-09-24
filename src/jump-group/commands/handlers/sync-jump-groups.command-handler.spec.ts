import { EventBus, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { JumpGroupRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-group/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpGroupsSyncedEvent, JumpGroupsSyncFailedEvent } from '../../events';
import { JumpGroupEntity } from '../../repositories/entities';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { SyncJumpGroupsCommand } from '../sync-jump-groups.command';
import { SyncJumpGroupsCommandHandler } from './sync-jump-groups.command-handler';

abstract class TestHelper {
    public static generateMockedJumpGroupRetrievedDtoOutputs(ids: number[]): JumpGroupRetrievedDtoOutput[] {
        return ids.map((id) => ({
            id,
            name: `jumpGroup-${id}`,
        }));
    }

    public static generateMockedJumpGroupEntities(ids: number[]): JumpGroupEntity[] {
        return ids.map((id) => ({
            id,
            name: `jumpGroup-${id}`,
            lastSyncDate: new Date('2025-01-01T00:00:00Z'),
            groupPolicyJumpGroups: [],
            remoteRdps: [],
            remoteVncs: [],
            protocolTunnelJumps: [],
            shellJumps: [],
            webJumps: [],
            jumpClients: [],
        }));
    }
}

describe('SyncJumpGroupsCommandHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let jumpGroupRepositoryService: JumpGroupRepositoryService;
    let handler: SyncJumpGroupsCommandHandler;

    beforeEach(() => {
        mockJumpGroupEntityCreateMethod();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        jumpGroupRepositoryService = mockJumpGroupRepositoryService();
        handler = new SyncJumpGroupsCommandHandler(appConfigService, queryBus, eventBus, jumpGroupRepositoryService);
    });

    describe('execute', () => {
        it('should publish an event and throw an error when an error occurs', async () => {
            const error = new Error('Test error');
            const eventBusPublish = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Test error');

            queryBus.execute = jest.fn().mockRejectedValue(error);

            await expect(handler.execute(new SyncJumpGroupsCommand('transaction-1', 123))).rejects.toThrow(error);

            expect(eventBusPublish).toHaveBeenCalledWith(
                expect.objectContaining(<JumpGroupsSyncFailedEvent>{
                    eventType: JumpGroupsSyncFailedEvent.EVENT_TYPE,
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
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpGroupRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpGroupRetrievedDtoOutputs([3, 4]))
                    .mockResolvedValue(TestHelper.generateMockedJumpGroupRetrievedDtoOutputs([3, 4])), // BT return repeating data when pagination limit is exceeded
                jumpGroupRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpGroupEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpGroupEntities([7, 8]))
                    .mockResolvedValue(TestHelper.generateMockedJumpGroupEntities([])),
                jumpGroupRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedJumpGroupEntities([1, 3])),
                expectedJumpGroupRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3, 4],
                    },
                ],
                expectedJumpGroupRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedJumpGroupEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedJumpGroupEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedJumpGroupEntities([4]),
                    },
                    {
                        iter: 4,
                        entity: TestHelper.generateMockedJumpGroupEntities([3]),
                    },
                ],
                expectedJumpGroupRepositoryServiceDeleteByIdsCall: [
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
                    createdJumpGroupIds: [2, 4],
                    updatedJumpGroupIds: [1, 3],
                    deletedJumpGroupIds: [5, 6, 7, 8],
                },
            },
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpGroupRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValue(TestHelper.generateMockedJumpGroupRetrievedDtoOutputs([3])),
                jumpGroupRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpGroupEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpGroupEntities([7])),
                jumpGroupRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedJumpGroupEntities([1, 3])),
                expectedJumpGroupRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3],
                    },
                ],
                expectedJumpGroupRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedJumpGroupEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedJumpGroupEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedJumpGroupEntities([3]),
                    },
                ],
                expectedJumpGroupRepositoryServiceDeleteByIdsCall: [
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
                    createdJumpGroupIds: [2],
                    updatedJumpGroupIds: [1, 3],
                    deletedJumpGroupIds: [5, 6, 7],
                },
            },
        ])(
            'should return, call method and publish event as expected',
            async ({
                queryBusExecuteResolvedValue,
                jumpGroupRepositoryFindByLastSyncDateBeforeResolvedValue,
                jumpGroupRepositoryServiceFindByIdsResolvedValue,
                expectedJumpGroupRepositoryServiceFindByIdsCall,
                expectedJumpGroupRepositoryServiceCreateOrUpdateByIdsCall,
                expectedJumpGroupRepositoryServiceDeleteByIdsCall,
                expectedResult,
            }) => {
                queryBus.execute = queryBusExecuteResolvedValue;
                jumpGroupRepositoryService.findByLastSyncDateBefore =
                    jumpGroupRepositoryFindByLastSyncDateBeforeResolvedValue;
                const jumpGroupRepositoryServiceFindByIds = jest
                    .spyOn(jumpGroupRepositoryService, 'findByIds')
                    .mockImplementation(jumpGroupRepositoryServiceFindByIdsResolvedValue);
                const jumpGroupRepositoryServiceCreateOrUpdateByIds = jest.spyOn(
                    jumpGroupRepositoryService,
                    'createOrUpdateByIds',
                );
                const jumpGroupRepositoryServiceDeleteByIds = jest.spyOn(jumpGroupRepositoryService, 'deleteByIds');
                const eventBusPublish = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(new SyncJumpGroupsCommand('transaction-1', 123));

                expect(jumpGroupRepositoryServiceFindByIds).toHaveBeenCalledTimes(
                    expectedJumpGroupRepositoryServiceFindByIdsCall.length,
                );
                for (const item of expectedJumpGroupRepositoryServiceFindByIdsCall) {
                    expect(jumpGroupRepositoryServiceFindByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(jumpGroupRepositoryServiceCreateOrUpdateByIds).toHaveBeenCalledTimes(
                    expectedJumpGroupRepositoryServiceCreateOrUpdateByIdsCall.length,
                );
                for (const item of expectedJumpGroupRepositoryServiceCreateOrUpdateByIdsCall) {
                    expect(jumpGroupRepositoryServiceCreateOrUpdateByIds).toHaveBeenNthCalledWith(
                        item.iter,
                        123,
                        item.entity,
                    );
                }

                expect(jumpGroupRepositoryServiceDeleteByIds).toHaveBeenCalledTimes(
                    expectedJumpGroupRepositoryServiceDeleteByIdsCall.length,
                );
                for (const item of expectedJumpGroupRepositoryServiceDeleteByIdsCall) {
                    expect(jumpGroupRepositoryServiceDeleteByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(result).toEqual(expectedResult);

                expect(eventBusPublish).toHaveBeenCalledWith(
                    expect.objectContaining(<JumpGroupsSyncedEvent>{
                        eventType: JumpGroupsSyncedEvent.EVENT_TYPE,
                        transactionId: 'transaction-1',
                        payload: {
                            createdJumpGroupIds: expectedResult.createdJumpGroupIds,
                            updatedJumpGroupIds: expectedResult.updatedJumpGroupIds,
                            deletedJumpGroupIds: expectedResult.deletedJumpGroupIds,
                            tenantId: 123,
                        },
                    }),
                );
            },
        );
    });
});

function mockJumpGroupEntityCreateMethod() {
    JumpGroupEntity.create = jest.fn().mockImplementation((id: number) => {
        return TestHelper.generateMockedJumpGroupEntities([id])[0];
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

function mockJumpGroupRepositoryService(): JumpGroupRepositoryService {
    const service = {} as JumpGroupRepositoryService;
    service.findByIds = jest.fn();
    service.createOrUpdateByIds = jest.fn();
    service.createOrUpdateByIds = jest.fn();
    service.findByLastSyncDateBefore = jest.fn();
    service.deleteByIds = jest.fn();

    return service;
}
