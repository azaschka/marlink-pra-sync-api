import { EventBus, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { UserRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UsersSyncedEvent, UsersSyncFailedEvent } from '../../../user/events';
import { UserEntity } from '../../../user/repositories/entities';
import { UserRepositoryService } from '../../../user/repositories/services/user-repository.service';
import { SyncUsersCommand } from '../sync-users.command';
import { SyncUsersCommandHandler } from './sync-users.command-handler';

abstract class TestHelper {
    public static generateMockedUserRetrievedDtoOutputs(ids: number[]): UserRetrievedDtoOutput[] {
        return ids.map((id) => ({
            id,
            publicDisplayName: `user-${id}`,
        }));
    }

    public static generateMockedUserEntities(ids: number[]): UserEntity[] {
        return ids.map((id) => ({
            id,
            publicDisplayName: `user-${id}`,
            lastSyncDate: new Date('2025-01-01T00:00:00Z'),
            userGroupPolicies: [],
            teamUsers: [],
            groupPolicyMembers: [],
        }));
    }
}

describe('SyncUsersCommandHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let userRepositoryService: UserRepositoryService;
    let handler: SyncUsersCommandHandler;

    beforeEach(() => {
        mockUserEntityCreateMethod();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        userRepositoryService = mockUserRepositoryService();
        handler = new SyncUsersCommandHandler(appConfigService, queryBus, eventBus, userRepositoryService);
    });

    describe('execute', () => {
        it('should publish an event and throw an error when an error occurs', async () => {
            const error = new Error('Test error');
            const eventBusPublish = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Test error');

            queryBus.execute = jest.fn().mockRejectedValue(error);

            await expect(handler.execute(new SyncUsersCommand('transaction-1', 123))).rejects.toThrow(error);

            expect(eventBusPublish).toHaveBeenCalledWith(
                expect.objectContaining(<UsersSyncFailedEvent>{
                    eventType: UsersSyncFailedEvent.EVENT_TYPE,
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
                    .mockResolvedValueOnce(TestHelper.generateMockedUserRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValueOnce(TestHelper.generateMockedUserRetrievedDtoOutputs([3, 4]))
                    .mockResolvedValue(TestHelper.generateMockedUserRetrievedDtoOutputs([3, 4])), // BT return repeating data when pagination limit is exceeded
                userRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedUserEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedUserEntities([7, 8]))
                    .mockResolvedValue(TestHelper.generateMockedUserEntities([])),
                userRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedUserEntities([1, 3])),
                expectedUserRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3, 4],
                    },
                ],
                expectedUserRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedUserEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedUserEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedUserEntities([4]),
                    },
                    {
                        iter: 4,
                        entity: TestHelper.generateMockedUserEntities([3]),
                    },
                ],
                expectedUserRepositoryServiceDeleteByIdsCall: [
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
                    createdUserIds: [2, 4],
                    updatedUserIds: [1, 3],
                    deletedUserIds: [5, 6, 7, 8],
                },
            },
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedUserRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValue(TestHelper.generateMockedUserRetrievedDtoOutputs([3])),
                userRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedUserEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedUserEntities([7])),
                userRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedUserEntities([1, 3])),
                expectedUserRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3],
                    },
                ],
                expectedUserRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedUserEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedUserEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedUserEntities([3]),
                    },
                ],
                expectedUserRepositoryServiceDeleteByIdsCall: [
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
                    createdUserIds: [2],
                    updatedUserIds: [1, 3],
                    deletedUserIds: [5, 6, 7],
                },
            },
        ])(
            'should return, call method and publish event as expected',
            async ({
                queryBusExecuteResolvedValue,
                userRepositoryFindByLastSyncDateBeforeResolvedValue,
                userRepositoryServiceFindByIdsResolvedValue,
                expectedUserRepositoryServiceFindByIdsCall,
                expectedUserRepositoryServiceCreateOrUpdateByIdsCall,
                expectedUserRepositoryServiceDeleteByIdsCall,
                expectedResult,
            }) => {
                queryBus.execute = queryBusExecuteResolvedValue;
                userRepositoryService.findByLastSyncDateBefore = userRepositoryFindByLastSyncDateBeforeResolvedValue;
                const userRepositoryServiceFindByIds = jest
                    .spyOn(userRepositoryService, 'findByIds')
                    .mockImplementation(userRepositoryServiceFindByIdsResolvedValue);
                const userRepositoryServiceCreateOrUpdateByIds = jest.spyOn(
                    userRepositoryService,
                    'createOrUpdateByIds',
                );
                const userRepositoryServiceDeleteByIds = jest.spyOn(userRepositoryService, 'deleteByIds');
                const eventBusPublish = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(new SyncUsersCommand('transaction-1', 123));

                expect(userRepositoryServiceFindByIds).toHaveBeenCalledTimes(
                    expectedUserRepositoryServiceFindByIdsCall.length,
                );
                for (const item of expectedUserRepositoryServiceFindByIdsCall) {
                    expect(userRepositoryServiceFindByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(userRepositoryServiceCreateOrUpdateByIds).toHaveBeenCalledTimes(
                    expectedUserRepositoryServiceCreateOrUpdateByIdsCall.length,
                );
                for (const item of expectedUserRepositoryServiceCreateOrUpdateByIdsCall) {
                    expect(userRepositoryServiceCreateOrUpdateByIds).toHaveBeenNthCalledWith(
                        item.iter,
                        123,
                        item.entity,
                    );
                }

                expect(userRepositoryServiceDeleteByIds).toHaveBeenCalledTimes(
                    expectedUserRepositoryServiceDeleteByIdsCall.length,
                );
                for (const item of expectedUserRepositoryServiceDeleteByIdsCall) {
                    expect(userRepositoryServiceDeleteByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(result).toEqual(expectedResult);

                expect(eventBusPublish).toHaveBeenCalledWith(
                    expect.objectContaining(<UsersSyncedEvent>{
                        eventType: UsersSyncedEvent.EVENT_TYPE,
                        transactionId: 'transaction-1',
                        payload: {
                            tenantId: 123,
                            createdUserIds: expectedResult.createdUserIds,
                            updatedUserIds: expectedResult.updatedUserIds,
                            deletedUserIds: expectedResult.deletedUserIds,
                        },
                    }),
                );
            },
        );
    });
});

function mockUserEntityCreateMethod() {
    UserEntity.create = jest.fn().mockImplementation((id: number) => {
        return TestHelper.generateMockedUserEntities([id])[0];
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

function mockUserRepositoryService(): UserRepositoryService {
    const service = {} as UserRepositoryService;
    service.findByIds = jest.fn();
    service.createOrUpdateByIds = jest.fn();
    service.findByLastSyncDateBefore = jest.fn();
    service.deleteByIds = jest.fn();

    return service;
}
