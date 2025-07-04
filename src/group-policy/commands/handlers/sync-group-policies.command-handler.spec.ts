import { EventBus, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { GroupPolicyRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPoliciesSyncedEvent, GroupPoliciesSyncFailedEvent } from '../../events';
import { GroupPolicyEntity } from '../../repositories/entities';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { SyncGroupPoliciesCommand } from '../sync-group-policies.command';
import { SyncGroupPoliciesCommandHandler } from './sync-group-policies.command-handler';

abstract class TestHelper {
    public static generateMockedGroupPolicyRetrievedDtoOutputs(ids: number[]): GroupPolicyRetrievedDtoOutput[] {
        return ids.map((id) => ({
            id,
            name: `group-policy-${id}`,
        }));
    }

    public static generateMockedGroupPolicyEntities(ids: number[]): GroupPolicyEntity[] {
        return ids.map((id) => ({
            id,
            name: `group-policy-${id}`,
            lastSyncDate: new Date('2025-01-01T00:00:00Z'),
            userGroupPolicies: [],
            groupPolicyJumpoints: [],
            groupPolicyJumpGroups: [],
            groupPolicyMembers: [],
            groupPolicyTeams: [],
        }));
    }
}

describe('SyncGroupPoliciesCommandHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let groupPolicyRepositoryService: GroupPolicyRepositoryService;
    let handler: SyncGroupPoliciesCommandHandler;

    beforeEach(() => {
        mockGroupPolicyEntityCreateMethod();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        groupPolicyRepositoryService = mockGroupPolicyRepositoryService();
        handler = new SyncGroupPoliciesCommandHandler(
            appConfigService,
            queryBus,
            eventBus,
            groupPolicyRepositoryService,
        );
    });

    describe('execute', () => {
        it('should publish an event and throw an error when an error occurs', async () => {
            const error = new Error('Test error');
            const eventBusPublish = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Test error');

            queryBus.execute = jest.fn().mockRejectedValue(error);

            await expect(handler.execute(new SyncGroupPoliciesCommand('transaction-1'))).rejects.toThrow(error);

            expect(eventBusPublish).toHaveBeenCalledWith(
                expect.objectContaining(<GroupPoliciesSyncFailedEvent>{
                    eventType: GroupPoliciesSyncFailedEvent.EVENT_TYPE,
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
                    .mockResolvedValueOnce(TestHelper.generateMockedGroupPolicyRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValueOnce(TestHelper.generateMockedGroupPolicyRetrievedDtoOutputs([3, 4]))
                    .mockResolvedValue(TestHelper.generateMockedGroupPolicyRetrievedDtoOutputs([3, 4])), // BT return repeating data when pagination limit is exceeded
                groupPolicyRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedGroupPolicyEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedGroupPolicyEntities([7, 8]))
                    .mockResolvedValue(TestHelper.generateMockedGroupPolicyEntities([])),
                groupPolicyRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedGroupPolicyEntities([1, 3])),
                expectedGroupPolicyRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3, 4],
                    },
                ],
                expectedGroupPolicyRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedGroupPolicyEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedGroupPolicyEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedGroupPolicyEntities([4]),
                    },
                    {
                        iter: 4,
                        entity: TestHelper.generateMockedGroupPolicyEntities([3]),
                    },
                ],
                expectedGroupPolicyRepositoryServiceDeleteByIdsCall: [
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
                    createdGroupPolicyIds: [2, 4],
                    updatedGroupPolicyIds: [1, 3],
                    deletedGroupPolicyIds: [5, 6, 7, 8],
                },
            },
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedGroupPolicyRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValue(TestHelper.generateMockedGroupPolicyRetrievedDtoOutputs([3])),
                groupPolicyRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedGroupPolicyEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedGroupPolicyEntities([7])),
                groupPolicyRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedGroupPolicyEntities([1, 3])),
                expectedGroupPolicyRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3],
                    },
                ],
                expectedGroupPolicyRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedGroupPolicyEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedGroupPolicyEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedGroupPolicyEntities([3]),
                    },
                ],
                expectedGroupPolicyRepositoryServiceDeleteByIdsCall: [
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
                    createdGroupPolicyIds: [2],
                    updatedGroupPolicyIds: [1, 3],
                    deletedGroupPolicyIds: [5, 6, 7],
                },
            },
        ])(
            'should return, call method and publish event as expected',
            async ({
                queryBusExecuteResolvedValue,
                groupPolicyRepositoryFindByLastSyncDateBeforeResolvedValue,
                groupPolicyRepositoryServiceFindByIdsResolvedValue,
                expectedGroupPolicyRepositoryServiceFindByIdsCall,
                expectedGroupPolicyRepositoryServiceCreateOrUpdateByIdsCall,
                expectedGroupPolicyRepositoryServiceDeleteByIdsCall,
                expectedResult,
            }) => {
                queryBus.execute = queryBusExecuteResolvedValue;
                groupPolicyRepositoryService.findByLastSyncDateBefore =
                    groupPolicyRepositoryFindByLastSyncDateBeforeResolvedValue;
                const groupPolicyRepositoryServiceFindByIds = jest
                    .spyOn(groupPolicyRepositoryService, 'findByIds')
                    .mockImplementation(groupPolicyRepositoryServiceFindByIdsResolvedValue);
                const groupPolicyRepositoryServiceCreateOrUpdateByIds = jest.spyOn(
                    groupPolicyRepositoryService,
                    'createOrUpdateByIds',
                );
                const groupPolicyRepositoryServiceDeleteByIds = jest.spyOn(groupPolicyRepositoryService, 'deleteByIds');
                const eventBusPublish = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(new SyncGroupPoliciesCommand('transaction-1'));

                expect(groupPolicyRepositoryServiceFindByIds).toHaveBeenCalledTimes(
                    expectedGroupPolicyRepositoryServiceFindByIdsCall.length,
                );
                for (const item of expectedGroupPolicyRepositoryServiceFindByIdsCall) {
                    expect(groupPolicyRepositoryServiceFindByIds).toHaveBeenNthCalledWith(item.iter, item.ids);
                }

                expect(groupPolicyRepositoryServiceCreateOrUpdateByIds).toHaveBeenCalledTimes(
                    expectedGroupPolicyRepositoryServiceCreateOrUpdateByIdsCall.length,
                );
                for (const item of expectedGroupPolicyRepositoryServiceCreateOrUpdateByIdsCall) {
                    expect(groupPolicyRepositoryServiceCreateOrUpdateByIds).toHaveBeenNthCalledWith(
                        item.iter,
                        item.entity,
                    );
                }

                expect(groupPolicyRepositoryServiceDeleteByIds).toHaveBeenCalledTimes(
                    expectedGroupPolicyRepositoryServiceDeleteByIdsCall.length,
                );
                for (const item of expectedGroupPolicyRepositoryServiceDeleteByIdsCall) {
                    expect(groupPolicyRepositoryServiceDeleteByIds).toHaveBeenNthCalledWith(item.iter, item.ids);
                }

                expect(result).toEqual(expectedResult);

                expect(eventBusPublish).toHaveBeenCalledWith(
                    expect.objectContaining(<GroupPoliciesSyncedEvent>{
                        eventType: GroupPoliciesSyncedEvent.EVENT_TYPE,
                        transactionId: 'transaction-1',
                        payload: {
                            createdGroupPolicyIds: expectedResult.createdGroupPolicyIds,
                            updatedGroupPolicyIds: expectedResult.updatedGroupPolicyIds,
                            deletedGroupPolicyIds: expectedResult.deletedGroupPolicyIds,
                        },
                    }),
                );
            },
        );
    });
});

function mockGroupPolicyEntityCreateMethod() {
    GroupPolicyEntity.create = jest.fn().mockImplementation((id: number) => {
        return TestHelper.generateMockedGroupPolicyEntities([id])[0];
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

function mockGroupPolicyRepositoryService(): GroupPolicyRepositoryService {
    const service = {} as GroupPolicyRepositoryService;
    service.findByIds = jest.fn();
    service.createOrUpdateByIds = jest.fn();
    service.findByLastSyncDateBefore = jest.fn();
    service.deleteByIds = jest.fn();

    return service;
}
