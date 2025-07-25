import { EventBus, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { RemoteVncRetrievedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/dtos/outputs';
import { JumpointEntity } from '../../../../jumpoint/repositories/entities';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { RemoteVncsSyncedEvent, RemoteVncsSyncFailedEvent } from '../../events';
import { RemoteVncEntity } from '../../repositories/entities';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { SyncRemoteVncsCommand } from '../sync-remote-vncs.command';
import { SyncRemoteVncsCommandHandler } from './sync-remote-vncs.command-handler';

abstract class TestHelper {
    public static generateMockedRemoteVncRetrievedDtoOutputs(ids: number[]): RemoteVncRetrievedDtoOutput[] {
        return ids.map((id) => ({
            id,
            name: `remote-vnc-${id}`,
            hostname: `hostname-${id}`,
            jumpGroupId: id,
            jumpointId: id,
        }));
    }

    public static generateMockedRemoteVncEntities(ids: number[]): RemoteVncEntity[] {
        return ids.map((id) => ({
            id,
            name: `remote-vnc-${id}`,
            hostname: `hostname-${id}`,
            jumpGroupId: id,
            jumpointId: id,
            lastSyncDate: new Date('2025-01-01T00:00:00Z'),
            jumpoint: {} as JumpointEntity,
        }));
    }
}

describe('SyncRemoteVncsCommandHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let remoteVncRepositoryService: RemoteVncRepositoryService;
    let handler: SyncRemoteVncsCommandHandler;

    beforeEach(() => {
        mockRemoteVncEntityCreateMethod();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        remoteVncRepositoryService = mockRemoteVncRepositoryService();
        handler = new SyncRemoteVncsCommandHandler(appConfigService, queryBus, eventBus, remoteVncRepositoryService);
    });

    describe('execute', () => {
        it('should publish an event and throw an error when an error occurs', async () => {
            const error = new Error('Test error');
            const eventBusPublish = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Test error');

            queryBus.execute = jest.fn().mockRejectedValue(error);

            await expect(handler.execute(new SyncRemoteVncsCommand('transaction-1'))).rejects.toThrow(error);

            expect(eventBusPublish).toHaveBeenCalledWith(
                expect.objectContaining(<RemoteVncsSyncFailedEvent>{
                    eventType: RemoteVncsSyncFailedEvent.EVENT_TYPE,
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
                    .mockResolvedValueOnce(TestHelper.generateMockedRemoteVncRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValueOnce(TestHelper.generateMockedRemoteVncRetrievedDtoOutputs([3, 4]))
                    .mockResolvedValue(TestHelper.generateMockedRemoteVncRetrievedDtoOutputs([3, 4])), // BT return repeating data when pagination limit is exceeded
                remoteVncRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedRemoteVncEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedRemoteVncEntities([7, 8]))
                    .mockResolvedValue(TestHelper.generateMockedRemoteVncEntities([])),
                remoteVncRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedRemoteVncEntities([1, 3])),
                expectedRemoteVncRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3, 4],
                    },
                ],
                expectedRemoteVncRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedRemoteVncEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedRemoteVncEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedRemoteVncEntities([4]),
                    },
                    {
                        iter: 4,
                        entity: TestHelper.generateMockedRemoteVncEntities([3]),
                    },
                ],
                expectedRemoteVncRepositoryServiceDeleteByIdsCall: [
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
                    createdRemoteVncIds: [2, 4],
                    updatedRemoteVncIds: [1, 3],
                    deletedRemoteVncIds: [5, 6, 7, 8],
                },
            },
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedRemoteVncRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValue(TestHelper.generateMockedRemoteVncRetrievedDtoOutputs([3])),
                remoteVncRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedRemoteVncEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedRemoteVncEntities([7])),
                remoteVncRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedRemoteVncEntities([1, 3])),
                expectedRemoteVncRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3],
                    },
                ],
                expectedRemoteVncRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedRemoteVncEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedRemoteVncEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedRemoteVncEntities([3]),
                    },
                ],
                expectedRemoteVncRepositoryServiceDeleteByIdsCall: [
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
                    createdRemoteVncIds: [2],
                    updatedRemoteVncIds: [1, 3],
                    deletedRemoteVncIds: [5, 6, 7],
                },
            },
        ])(
            'should return, call method and publish event as expected',
            async ({
                queryBusExecuteResolvedValue,
                remoteVncRepositoryFindByLastSyncDateBeforeResolvedValue,
                remoteVncRepositoryServiceFindByIdsResolvedValue,
                expectedRemoteVncRepositoryServiceFindByIdsCall,
                expectedRemoteVncRepositoryServiceCreateOrUpdateByIdsCall,
                expectedRemoteVncRepositoryServiceDeleteByIdsCall,
                expectedResult,
            }) => {
                queryBus.execute = queryBusExecuteResolvedValue;
                remoteVncRepositoryService.findByLastSyncDateBefore =
                    remoteVncRepositoryFindByLastSyncDateBeforeResolvedValue;
                const remoteVncRepositoryServiceFindByIds = jest
                    .spyOn(remoteVncRepositoryService, 'findByIds')
                    .mockImplementation(remoteVncRepositoryServiceFindByIdsResolvedValue);
                const remoteVncRepositoryServiceCreateOrUpdateByIds = jest.spyOn(
                    remoteVncRepositoryService,
                    'createOrUpdateByIds',
                );
                const remoteVncRepositoryServiceDeleteByIds = jest.spyOn(remoteVncRepositoryService, 'deleteByIds');
                const eventBusPublish = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(new SyncRemoteVncsCommand('transaction-1'));

                expect(remoteVncRepositoryServiceFindByIds).toHaveBeenCalledTimes(
                    expectedRemoteVncRepositoryServiceFindByIdsCall.length,
                );
                for (const item of expectedRemoteVncRepositoryServiceFindByIdsCall) {
                    expect(remoteVncRepositoryServiceFindByIds).toHaveBeenNthCalledWith(item.iter, item.ids);
                }

                expect(remoteVncRepositoryServiceCreateOrUpdateByIds).toHaveBeenCalledTimes(
                    expectedRemoteVncRepositoryServiceCreateOrUpdateByIdsCall.length,
                );
                for (const item of expectedRemoteVncRepositoryServiceCreateOrUpdateByIdsCall) {
                    expect(remoteVncRepositoryServiceCreateOrUpdateByIds).toHaveBeenNthCalledWith(
                        item.iter,
                        item.entity,
                    );
                }

                expect(remoteVncRepositoryServiceDeleteByIds).toHaveBeenCalledTimes(
                    expectedRemoteVncRepositoryServiceDeleteByIdsCall.length,
                );
                for (const item of expectedRemoteVncRepositoryServiceDeleteByIdsCall) {
                    expect(remoteVncRepositoryServiceDeleteByIds).toHaveBeenNthCalledWith(item.iter, item.ids);
                }

                expect(result).toEqual(expectedResult);

                expect(eventBusPublish).toHaveBeenCalledWith(
                    expect.objectContaining(<RemoteVncsSyncedEvent>{
                        eventType: RemoteVncsSyncedEvent.EVENT_TYPE,
                        transactionId: 'transaction-1',
                        payload: {
                            createdRemoteVncIds: expectedResult.createdRemoteVncIds,
                            updatedRemoteVncIds: expectedResult.updatedRemoteVncIds,
                            deletedRemoteVncIds: expectedResult.deletedRemoteVncIds,
                        },
                    }),
                );
            },
        );
    });
});

function mockRemoteVncEntityCreateMethod() {
    RemoteVncEntity.create = jest.fn().mockImplementation((id: number) => {
        return TestHelper.generateMockedRemoteVncEntities([id])[0];
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

function mockRemoteVncRepositoryService(): RemoteVncRepositoryService {
    const service = {} as RemoteVncRepositoryService;
    service.findByIds = jest.fn();
    service.createOrUpdateByIds = jest.fn();
    service.createOrUpdateByIds = jest.fn();
    service.findByLastSyncDateBefore = jest.fn();
    service.deleteByIds = jest.fn();

    return service;
}
