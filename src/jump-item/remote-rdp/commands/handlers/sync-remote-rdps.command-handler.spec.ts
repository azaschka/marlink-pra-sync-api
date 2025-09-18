import { EventBus, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { RemoteRdpRetrievedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/dtos/outputs';
import { JumpGroupEntity } from '../../../../jump-group/repositories/entities';
import { JumpointEntity } from '../../../../jumpoint/repositories/entities';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { RemoteRdpsSyncedEvent, RemoteRdpsSyncFailedEvent } from '../../events';
import { RemoteRdpEntity } from '../../repositories/entities';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';
import { SyncRemoteRdpsCommand } from '../sync-remote-rdps.command';
import { SyncRemoteRdpsCommandHandler } from './sync-remote-rdps.command-handler';

abstract class TestHelper {
    public static generateMockedRemoteRdpRetrievedDtoOutputs(ids: number[]): RemoteRdpRetrievedDtoOutput[] {
        return ids.map((id) => ({
            id,
            name: `remote-rdp-${id}`,
            hostname: `hostname-${id}`,
            jumpGroupId: id,
            jumpointId: id,
        }));
    }

    public static generateMockedRemoteRdpEntities(ids: number[]): RemoteRdpEntity[] {
        return ids.map((id) => ({
            id,
            name: `remote-rdp-${id}`,
            hostname: `hostname-${id}`,
            jumpGroupId: id,
            jumpointId: id,
            lastSyncDate: new Date('2025-01-01T00:00:00Z'),
            jumpoint: {} as JumpointEntity,
            jumpGroup: {} as JumpGroupEntity,
        }));
    }
}

describe('SyncRemoteRdpsCommandHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let remoteRdpRepositoryService: RemoteRdpRepositoryService;
    let handler: SyncRemoteRdpsCommandHandler;

    beforeEach(() => {
        mockRemoteRdpEntityCreateMethod();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        remoteRdpRepositoryService = mockRemoteRdpRepositoryService();
        handler = new SyncRemoteRdpsCommandHandler(appConfigService, queryBus, eventBus, remoteRdpRepositoryService);
    });

    describe('execute', () => {
        it('should publish an event and throw an error when an error occurs', async () => {
            const error = new Error('Test error');
            const eventBusPublish = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Test error');

            queryBus.execute = jest.fn().mockRejectedValue(error);

            await expect(handler.execute(new SyncRemoteRdpsCommand('transaction-1', 123))).rejects.toThrow(error);

            expect(eventBusPublish).toHaveBeenCalledWith(
                expect.objectContaining(<RemoteRdpsSyncFailedEvent>{
                    eventType: RemoteRdpsSyncFailedEvent.EVENT_TYPE,
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
                    .mockResolvedValueOnce(TestHelper.generateMockedRemoteRdpRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValueOnce(TestHelper.generateMockedRemoteRdpRetrievedDtoOutputs([3, 4]))
                    .mockResolvedValue(TestHelper.generateMockedRemoteRdpRetrievedDtoOutputs([3, 4])), // BT return repeating data when pagination limit is exceeded
                remoteRdpRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedRemoteRdpEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedRemoteRdpEntities([7, 8]))
                    .mockResolvedValue(TestHelper.generateMockedRemoteRdpEntities([])),
                remoteRdpRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedRemoteRdpEntities([1, 3])),
                expectedRemoteRdpRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3, 4],
                    },
                ],
                expectedRemoteRdpRepositoryServiceCreateOrUpdateByIdCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedRemoteRdpEntities([2])[0],
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedRemoteRdpEntities([1])[0],
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedRemoteRdpEntities([4])[0],
                    },
                    {
                        iter: 4,
                        entity: TestHelper.generateMockedRemoteRdpEntities([3])[0],
                    },
                ],
                expectedRemoteRdpRepositoryServiceDeleteByIdsCall: [
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
                    createdRemoteRdpIds: [2, 4],
                    updatedRemoteRdpIds: [1, 3],
                    deletedRemoteRdpIds: [5, 6, 7, 8],
                },
            },
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedRemoteRdpRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValue(TestHelper.generateMockedRemoteRdpRetrievedDtoOutputs([3])),
                remoteRdpRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedRemoteRdpEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedRemoteRdpEntities([7])),
                remoteRdpRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedRemoteRdpEntities([1, 3])),
                expectedRemoteRdpRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3],
                    },
                ],
                expectedRemoteRdpRepositoryServiceCreateOrUpdateByIdCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedRemoteRdpEntities([2])[0],
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedRemoteRdpEntities([1])[0],
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedRemoteRdpEntities([3])[0],
                    },
                ],
                expectedRemoteRdpRepositoryServiceDeleteByIdsCall: [
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
                    createdRemoteRdpIds: [2],
                    updatedRemoteRdpIds: [1, 3],
                    deletedRemoteRdpIds: [5, 6, 7],
                },
            },
        ])(
            'should return, call method and publish event as expected',
            async ({
                queryBusExecuteResolvedValue,
                remoteRdpRepositoryFindByLastSyncDateBeforeResolvedValue,
                remoteRdpRepositoryServiceFindByIdsResolvedValue,
                expectedRemoteRdpRepositoryServiceFindByIdsCall,
                expectedRemoteRdpRepositoryServiceCreateOrUpdateByIdCall,
                expectedRemoteRdpRepositoryServiceDeleteByIdsCall,
                expectedResult,
            }) => {
                queryBus.execute = queryBusExecuteResolvedValue;
                remoteRdpRepositoryService.findByLastSyncDateBefore =
                    remoteRdpRepositoryFindByLastSyncDateBeforeResolvedValue;
                const remoteRdpRepositoryServiceFindByIds = jest
                    .spyOn(remoteRdpRepositoryService, 'findByIds')
                    .mockImplementation(remoteRdpRepositoryServiceFindByIdsResolvedValue);
                const remoteRdpRepositoryServiceCreateOrUpdateById = jest.spyOn(
                    remoteRdpRepositoryService,
                    'createOrUpdateById',
                );
                const remoteRdpRepositoryServiceDeleteByIds = jest.spyOn(remoteRdpRepositoryService, 'deleteByIds');
                const eventBusPublish = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(new SyncRemoteRdpsCommand('transaction-1', 123));

                expect(remoteRdpRepositoryServiceFindByIds).toHaveBeenCalledTimes(
                    expectedRemoteRdpRepositoryServiceFindByIdsCall.length,
                );
                for (const item of expectedRemoteRdpRepositoryServiceFindByIdsCall) {
                    expect(remoteRdpRepositoryServiceFindByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(remoteRdpRepositoryServiceCreateOrUpdateById).toHaveBeenCalledTimes(
                    expectedRemoteRdpRepositoryServiceCreateOrUpdateByIdCall.length,
                );
                for (const item of expectedRemoteRdpRepositoryServiceCreateOrUpdateByIdCall) {
                    expect(remoteRdpRepositoryServiceCreateOrUpdateById).toHaveBeenNthCalledWith(
                        item.iter,
                        123,
                        item.entity,
                    );
                }

                expect(remoteRdpRepositoryServiceDeleteByIds).toHaveBeenCalledTimes(
                    expectedRemoteRdpRepositoryServiceDeleteByIdsCall.length,
                );
                for (const item of expectedRemoteRdpRepositoryServiceDeleteByIdsCall) {
                    expect(remoteRdpRepositoryServiceDeleteByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(result).toEqual(expectedResult);

                expect(eventBusPublish).toHaveBeenCalledWith(
                    expect.objectContaining(<RemoteRdpsSyncedEvent>{
                        eventType: RemoteRdpsSyncedEvent.EVENT_TYPE,
                        transactionId: 'transaction-1',
                        payload: {
                            createdRemoteRdpIds: expectedResult.createdRemoteRdpIds,
                            updatedRemoteRdpIds: expectedResult.updatedRemoteRdpIds,
                            deletedRemoteRdpIds: expectedResult.deletedRemoteRdpIds,
                        },
                    }),
                );
            },
        );
    });
});

function mockRemoteRdpEntityCreateMethod() {
    RemoteRdpEntity.create = jest.fn().mockImplementation((id: number) => {
        return TestHelper.generateMockedRemoteRdpEntities([id])[0];
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

function mockRemoteRdpRepositoryService(): RemoteRdpRepositoryService {
    const service = {} as RemoteRdpRepositoryService;
    service.findByIds = jest.fn();
    service.createOrUpdateById = jest.fn();
    service.findByLastSyncDateBefore = jest.fn();
    service.deleteByIds = jest.fn();

    return service;
}
