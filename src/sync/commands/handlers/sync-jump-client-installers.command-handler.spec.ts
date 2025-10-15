import { EventBus, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { JumpClientInstallerRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import { JumpClientInstallersSyncedEvent, JumpClientInstallersSyncFailedEvent } from '../../../jump-client/events';
import { JumpClientInstallerEntity } from '../../../jump-client/repositories/entities';
import { JumpClientInstallerRepositoryService } from '../../../jump-client/repositories/services/jump-client-installer-repository.service';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { SyncJumpClientInstallersCommand } from '../sync-jump-client-installers.command';
import { SyncJumpClientInstallersCommandHandler } from './sync-jump-client-installers.command-handler';

abstract class TestHelper {
    public static generateMockedJumpClientInstallerRetrievedDtoOutputs(
        ids: number[],
    ): JumpClientInstallerRetrievedDtoOutput[] {
        return ids.map((id) => ({
            id,
            jumpGroupId: id,
            name: `jump-client-installer-${id}`,
        }));
    }

    public static generateMockedJumpClientInstallerEntities(ids: number[]): JumpClientInstallerEntity[] {
        return ids.map((id) => ({
            id,
            jumpGroupId: id,
            name: `jump-client-installer-${id}`,
            lastSyncDate: new Date('2025-01-01T00:00:00Z'),
        }));
    }
}

describe('SyncJumpClientInstallersCommandHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let jumpClientInstallerRepositoryService: JumpClientInstallerRepositoryService;
    let handler: SyncJumpClientInstallersCommandHandler;

    beforeEach(() => {
        mockJumpClientInstallerEntityCreateMethod();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        jumpClientInstallerRepositoryService = mockJumpClientInstallerRepositoryService();
        handler = new SyncJumpClientInstallersCommandHandler(
            appConfigService,
            queryBus,
            eventBus,
            jumpClientInstallerRepositoryService,
        );
    });

    describe('execute', () => {
        it('should publish an event and throw an error when an error occurs', async () => {
            const error = new Error('Test error');
            const eventBusPublish = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Test error');

            queryBus.execute = jest.fn().mockRejectedValue(error);

            await expect(handler.execute(new SyncJumpClientInstallersCommand('transaction-1', 123))).rejects.toThrow(
                error,
            );

            expect(eventBusPublish).toHaveBeenCalledWith(
                expect.objectContaining(<JumpClientInstallersSyncFailedEvent>{
                    eventType: JumpClientInstallersSyncFailedEvent.EVENT_TYPE,
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
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpClientInstallerRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpClientInstallerRetrievedDtoOutputs([3, 4]))
                    .mockResolvedValue(TestHelper.generateMockedJumpClientInstallerRetrievedDtoOutputs([3, 4])), // BT return repeating data when pagination limit is exceeded
                jumpClientInstallerRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpClientInstallerEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpClientInstallerEntities([7, 8]))
                    .mockResolvedValue(TestHelper.generateMockedJumpClientInstallerEntities([])),
                jumpClientInstallerRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedJumpClientInstallerEntities([1, 3])),
                expectedJumpClientInstallerRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3, 4],
                    },
                ],
                expectedJumpClientInstallerRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedJumpClientInstallerEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedJumpClientInstallerEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedJumpClientInstallerEntities([4]),
                    },
                    {
                        iter: 4,
                        entity: TestHelper.generateMockedJumpClientInstallerEntities([3]),
                    },
                ],
                expectedJumpClientInstallerRepositoryServiceDeleteByIdsCall: [
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
                    createdJumpClientInstallerIds: [2, 4],
                    updatedJumpClientInstallerIds: [1, 3],
                    deletedJumpClientInstallerIds: [5, 6, 7, 8],
                },
            },
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpClientInstallerRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValue(TestHelper.generateMockedJumpClientInstallerRetrievedDtoOutputs([3])),
                jumpClientInstallerRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpClientInstallerEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpClientInstallerEntities([7])),
                jumpClientInstallerRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedJumpClientInstallerEntities([1, 3])),
                expectedJumpClientInstallerRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3],
                    },
                ],
                expectedJumpClientInstallerRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedJumpClientInstallerEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedJumpClientInstallerEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedJumpClientInstallerEntities([3]),
                    },
                ],
                expectedJumpClientInstallerRepositoryServiceDeleteByIdsCall: [
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
                    createdJumpClientInstallerIds: [2],
                    updatedJumpClientInstallerIds: [1, 3],
                    deletedJumpClientInstallerIds: [5, 6, 7],
                },
            },
        ])(
            'should return, call method and publish event as expected',
            async ({
                queryBusExecuteResolvedValue,
                jumpClientInstallerRepositoryFindByLastSyncDateBeforeResolvedValue,
                jumpClientInstallerRepositoryServiceFindByIdsResolvedValue,
                expectedJumpClientInstallerRepositoryServiceFindByIdsCall,
                expectedJumpClientInstallerRepositoryServiceCreateOrUpdateByIdsCall,
                expectedJumpClientInstallerRepositoryServiceDeleteByIdsCall,
                expectedResult,
            }) => {
                queryBus.execute = queryBusExecuteResolvedValue;
                jumpClientInstallerRepositoryService.findByLastSyncDateBefore =
                    jumpClientInstallerRepositoryFindByLastSyncDateBeforeResolvedValue;
                const jumpClientInstallerRepositoryServiceFindByIds = jest
                    .spyOn(jumpClientInstallerRepositoryService, 'findByIds')
                    .mockImplementation(jumpClientInstallerRepositoryServiceFindByIdsResolvedValue);
                const jumpClientInstallerRepositoryServiceCreateOrUpdateByIds = jest.spyOn(
                    jumpClientInstallerRepositoryService,
                    'createOrUpdateByIds',
                );
                const jumpClientInstallerRepositoryServiceDeleteByIds = jest.spyOn(
                    jumpClientInstallerRepositoryService,
                    'deleteByIds',
                );
                const eventBusPublish = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(new SyncJumpClientInstallersCommand('transaction-1', 123));

                expect(jumpClientInstallerRepositoryServiceFindByIds).toHaveBeenCalledTimes(
                    expectedJumpClientInstallerRepositoryServiceFindByIdsCall.length,
                );
                for (const item of expectedJumpClientInstallerRepositoryServiceFindByIdsCall) {
                    expect(jumpClientInstallerRepositoryServiceFindByIds).toHaveBeenNthCalledWith(
                        item.iter,
                        123,
                        item.ids,
                    );
                }

                expect(jumpClientInstallerRepositoryServiceCreateOrUpdateByIds).toHaveBeenCalledTimes(
                    expectedJumpClientInstallerRepositoryServiceCreateOrUpdateByIdsCall.length,
                );
                for (const item of expectedJumpClientInstallerRepositoryServiceCreateOrUpdateByIdsCall) {
                    expect(jumpClientInstallerRepositoryServiceCreateOrUpdateByIds).toHaveBeenNthCalledWith(
                        item.iter,
                        123,
                        item.entity,
                    );
                }

                expect(jumpClientInstallerRepositoryServiceDeleteByIds).toHaveBeenCalledTimes(
                    expectedJumpClientInstallerRepositoryServiceDeleteByIdsCall.length,
                );
                for (const item of expectedJumpClientInstallerRepositoryServiceDeleteByIdsCall) {
                    expect(jumpClientInstallerRepositoryServiceDeleteByIds).toHaveBeenNthCalledWith(
                        item.iter,
                        123,
                        item.ids,
                    );
                }

                expect(result).toEqual(expectedResult);

                expect(eventBusPublish).toHaveBeenCalledWith(
                    expect.objectContaining(<JumpClientInstallersSyncedEvent>{
                        eventType: JumpClientInstallersSyncedEvent.EVENT_TYPE,
                        transactionId: 'transaction-1',
                        payload: {
                            createdJumpClientInstallerIds: expectedResult.createdJumpClientInstallerIds,
                            updatedJumpClientInstallerIds: expectedResult.updatedJumpClientInstallerIds,
                            deletedJumpClientInstallerIds: expectedResult.deletedJumpClientInstallerIds,
                            tenantId: 123,
                        },
                    }),
                );
            },
        );
    });
});

function mockJumpClientInstallerEntityCreateMethod() {
    JumpClientInstallerEntity.create = jest.fn().mockImplementation((id: number) => {
        return TestHelper.generateMockedJumpClientInstallerEntities([id])[0];
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

function mockJumpClientInstallerRepositoryService(): JumpClientInstallerRepositoryService {
    const service = {} as JumpClientInstallerRepositoryService;
    service.findByIds = jest.fn();
    service.createOrUpdateByIds = jest.fn();
    service.findByLastSyncDateBefore = jest.fn();
    service.deleteByIds = jest.fn();

    return service;
}
