import { EventBus, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { JumpPolicyRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-policy/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpPoliciesSyncedEvent, JumpPoliciesSyncFailedEvent } from '../../events';
import { JumpPolicyEntity } from '../../repositories/entities';
import { JumpPolicyRepositoryService } from '../../repositories/services/jump-policy-repository.service';
import { SyncJumpPoliciesCommand } from '../sync-jump-policies.command';
import { SyncJumpPoliciesCommandHandler } from './sync-jump-policies.command-handler';

abstract class TestHelper {
    public static generateMockedJumpPolicyRetrievedDtoOutputs(ids: number[]): JumpPolicyRetrievedDtoOutput[] {
        return ids.map((id) => ({
            id,
            displayName: `jump-policy-${id}`,
        }));
    }

    public static generateMockedJumpPolicyEntities(ids: number[]): JumpPolicyEntity[] {
        return ids.map((id) => ({
            id,
            displayName: `jump-policy-${id}`,
            lastSyncDate: new Date('2025-01-01T00:00:00Z'),
            remoteRdps: [],
            remoteVncs: [],
            protocolTunnelJumps: [],
            shellJumps: [],
            webJumps: [],
            jumpClients: [],
        }));
    }
}

describe('SyncJumpPoliciesCommandHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let jumpPolicyRepositoryService: JumpPolicyRepositoryService;
    let handler: SyncJumpPoliciesCommandHandler;

    beforeEach(() => {
        mockJumpPolicyEntityCreateMethod();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        jumpPolicyRepositoryService = mockJumpPolicyRepositoryService();
        handler = new SyncJumpPoliciesCommandHandler(appConfigService, queryBus, eventBus, jumpPolicyRepositoryService);
    });

    describe('execute', () => {
        it('should publish an event and throw an error when an error occurs', async () => {
            const error = new Error('Test error');
            const eventBusPublish = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Test error');

            queryBus.execute = jest.fn().mockRejectedValue(error);

            await expect(handler.execute(new SyncJumpPoliciesCommand('transaction-1', 123))).rejects.toThrow(error);

            expect(eventBusPublish).toHaveBeenCalledWith(
                expect.objectContaining(<JumpPoliciesSyncFailedEvent>{
                    eventType: JumpPoliciesSyncFailedEvent.EVENT_TYPE,
                    transactionId: 'transaction-1',
                    payload: {
                        errorMessage: 'Test error',
                    },
                }),
            );
        });

        it.each([
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpPolicyRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpPolicyRetrievedDtoOutputs([3, 4]))
                    .mockResolvedValue(TestHelper.generateMockedJumpPolicyRetrievedDtoOutputs([3, 4])), // BT return repeating data when pagination limit is exceeded
                jumpPolicyRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpPolicyEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpPolicyEntities([7, 8]))
                    .mockResolvedValue(TestHelper.generateMockedJumpPolicyEntities([])),
                jumpPolicyRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedJumpPolicyEntities([1, 3])),
                expectedJumpPolicyRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3, 4],
                    },
                ],
                expectedJumpPolicyRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedJumpPolicyEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedJumpPolicyEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedJumpPolicyEntities([4]),
                    },
                    {
                        iter: 4,
                        entity: TestHelper.generateMockedJumpPolicyEntities([3]),
                    },
                ],
                expectedJumpPolicyRepositoryServiceDeleteByIdsCall: [
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
                    createdJumpPolicyIds: [2, 4],
                    updatedJumpPolicyIds: [1, 3],
                    deletedJumpPolicyIds: [5, 6, 7, 8],
                },
            },
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpPolicyRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValue(TestHelper.generateMockedJumpPolicyRetrievedDtoOutputs([3])),
                jumpPolicyRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpPolicyEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpPolicyEntities([7])),
                jumpPolicyRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedJumpPolicyEntities([1, 3])),
                expectedJumpPolicyRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3],
                    },
                ],
                expectedJumpPolicyRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedJumpPolicyEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedJumpPolicyEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedJumpPolicyEntities([3]),
                    },
                ],
                expectedJumpPolicyRepositoryServiceDeleteByIdsCall: [
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
                    createdJumpPolicyIds: [2],
                    updatedJumpPolicyIds: [1, 3],
                    deletedJumpPolicyIds: [5, 6, 7],
                },
            },
        ])(
            'should return, call method and publish event as expected',
            async ({
                queryBusExecuteResolvedValue,
                jumpPolicyRepositoryFindByLastSyncDateBeforeResolvedValue,
                jumpPolicyRepositoryServiceFindByIdsResolvedValue,
                expectedJumpPolicyRepositoryServiceFindByIdsCall,
                expectedJumpPolicyRepositoryServiceCreateOrUpdateByIdsCall,
                expectedJumpPolicyRepositoryServiceDeleteByIdsCall,
                expectedResult,
            }) => {
                queryBus.execute = queryBusExecuteResolvedValue;
                jumpPolicyRepositoryService.findByLastSyncDateBefore =
                    jumpPolicyRepositoryFindByLastSyncDateBeforeResolvedValue;
                const jumpPolicyRepositoryServiceFindByIds = jest
                    .spyOn(jumpPolicyRepositoryService, 'findByIds')
                    .mockImplementation(jumpPolicyRepositoryServiceFindByIdsResolvedValue);
                const jumpPolicyRepositoryServiceCreateOrUpdateByIds = jest.spyOn(
                    jumpPolicyRepositoryService,
                    'createOrUpdateByIds',
                );
                const jumpPolicyRepositoryServiceDeleteByIds = jest.spyOn(jumpPolicyRepositoryService, 'deleteByIds');
                const eventBusPublish = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(new SyncJumpPoliciesCommand('transaction-1', 123));

                expect(jumpPolicyRepositoryServiceFindByIds).toHaveBeenCalledTimes(
                    expectedJumpPolicyRepositoryServiceFindByIdsCall.length,
                );
                for (const item of expectedJumpPolicyRepositoryServiceFindByIdsCall) {
                    expect(jumpPolicyRepositoryServiceFindByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(jumpPolicyRepositoryServiceCreateOrUpdateByIds).toHaveBeenCalledTimes(
                    expectedJumpPolicyRepositoryServiceCreateOrUpdateByIdsCall.length,
                );
                for (const item of expectedJumpPolicyRepositoryServiceCreateOrUpdateByIdsCall) {
                    expect(jumpPolicyRepositoryServiceCreateOrUpdateByIds).toHaveBeenNthCalledWith(
                        item.iter,
                        123,
                        item.entity,
                    );
                }

                expect(jumpPolicyRepositoryServiceDeleteByIds).toHaveBeenCalledTimes(
                    expectedJumpPolicyRepositoryServiceDeleteByIdsCall.length,
                );
                for (const item of expectedJumpPolicyRepositoryServiceDeleteByIdsCall) {
                    expect(jumpPolicyRepositoryServiceDeleteByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(result).toEqual(expectedResult);

                expect(eventBusPublish).toHaveBeenCalledWith(
                    expect.objectContaining(<JumpPoliciesSyncedEvent>{
                        eventType: JumpPoliciesSyncedEvent.EVENT_TYPE,
                        transactionId: 'transaction-1',
                        payload: {
                            createdJumpPolicyIds: expectedResult.createdJumpPolicyIds,
                            updatedJumpPolicyIds: expectedResult.updatedJumpPolicyIds,
                            deletedJumpPolicyIds: expectedResult.deletedJumpPolicyIds,
                        },
                    }),
                );
            },
        );
    });
});

function mockJumpPolicyEntityCreateMethod() {
    JumpPolicyEntity.create = jest.fn().mockImplementation((id: number) => {
        return TestHelper.generateMockedJumpPolicyEntities([id])[0];
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

function mockJumpPolicyRepositoryService(): JumpPolicyRepositoryService {
    const service = {} as JumpPolicyRepositoryService;
    service.findByIds = jest.fn();
    service.createOrUpdateByIds = jest.fn();
    service.findByLastSyncDateBefore = jest.fn();
    service.deleteByIds = jest.fn();

    return service;
}
