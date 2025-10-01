import { EventBus, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { WebJumpRetrievedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/dtos/outputs';
import { JumpGroupEntity } from '../../../../jump-group/repositories/entities';
import { JumpointEntity } from '../../../../jumpoint/repositories/entities';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { WebJumpsSyncedEvent, WebJumpsSyncFailedEvent } from '../../events';
import { WebJumpEntity } from '../../repositories/entities';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { SyncWebJumpsCommand } from '../sync-web-jumps.command';
import { SyncWebJumpsCommandHandler } from './sync-web-jumps.command-handler';

abstract class TestHelper {
    public static generateMockedWebJumpRetrievedDtoOutputs(ids: number[]): WebJumpRetrievedDtoOutput[] {
        return ids.map((id) => ({
            id,
            name: `web-jump-${id}`,
            url: `url-${id}`,
            jumpGroupId: id,
            jumpointId: id,
        }));
    }

    public static generateMockedWebJumpEntities(ids: number[]): WebJumpEntity[] {
        return ids.map((id) => ({
            id,
            name: `web-jump-${id}`,
            url: `url-${id}`,
            jumpGroupId: id,
            jumpointId: id,
            lastSyncDate: new Date('2025-01-01T00:00:00Z'),
            jumpoint: {} as JumpointEntity,
            jumpGroup: {} as JumpGroupEntity,
        }));
    }
}

describe('SyncWebJumpsCommandHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let webJumpRepositoryService: WebJumpRepositoryService;
    let handler: SyncWebJumpsCommandHandler;

    beforeEach(() => {
        mockWebJumpEntityCreateMethod();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        webJumpRepositoryService = mockWebJumpRepositoryService();
        handler = new SyncWebJumpsCommandHandler(appConfigService, queryBus, eventBus, webJumpRepositoryService);
    });

    describe('execute', () => {
        it('should publish an event and throw an error when an error occurs', async () => {
            const error = new Error('Test error');
            const eventBusPublish = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Test error');

            queryBus.execute = jest.fn().mockRejectedValue(error);

            await expect(handler.execute(new SyncWebJumpsCommand('transaction-1', 123))).rejects.toThrow(error);

            expect(eventBusPublish).toHaveBeenCalledWith(
                expect.objectContaining(<WebJumpsSyncFailedEvent>{
                    eventType: WebJumpsSyncFailedEvent.EVENT_TYPE,
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
                    .mockResolvedValueOnce(TestHelper.generateMockedWebJumpRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValueOnce(TestHelper.generateMockedWebJumpRetrievedDtoOutputs([3, 4]))
                    .mockResolvedValue(TestHelper.generateMockedWebJumpRetrievedDtoOutputs([3, 4])), // BT return repeating data when pagination limit is exceeded
                webJumpRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedWebJumpEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedWebJumpEntities([7, 8]))
                    .mockResolvedValue(TestHelper.generateMockedWebJumpEntities([])),
                webJumpRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedWebJumpEntities([1, 3])),
                expectedWebJumpRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3, 4],
                    },
                ],
                expectedWebJumpRepositoryServiceCreateOrUpdateByIdCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedWebJumpEntities([2])[0],
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedWebJumpEntities([1])[0],
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedWebJumpEntities([4])[0],
                    },
                    {
                        iter: 4,
                        entity: TestHelper.generateMockedWebJumpEntities([3])[0],
                    },
                ],
                expectedWebJumpRepositoryServiceDeleteByIdsCall: [
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
                    createdWebJumpIds: [2, 4],
                    updatedWebJumpIds: [1, 3],
                    deletedWebJumpIds: [5, 6, 7, 8],
                },
            },
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedWebJumpRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValue(TestHelper.generateMockedWebJumpRetrievedDtoOutputs([3])),
                webJumpRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedWebJumpEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedWebJumpEntities([7])),
                webJumpRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedWebJumpEntities([1, 3])),
                expectedWebJumpRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3],
                    },
                ],
                expectedWebJumpRepositoryServiceCreateOrUpdateByIdCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedWebJumpEntities([2])[0],
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedWebJumpEntities([1])[0],
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedWebJumpEntities([3])[0],
                    },
                ],
                expectedWebJumpRepositoryServiceDeleteByIdsCall: [
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
                    createdWebJumpIds: [2],
                    updatedWebJumpIds: [1, 3],
                    deletedWebJumpIds: [5, 6, 7],
                },
            },
        ])(
            'should return, call method and publish event as expected',
            async ({
                queryBusExecuteResolvedValue,
                webJumpRepositoryFindByLastSyncDateBeforeResolvedValue,
                webJumpRepositoryServiceFindByIdsResolvedValue,
                expectedWebJumpRepositoryServiceFindByIdsCall,
                expectedWebJumpRepositoryServiceCreateOrUpdateByIdCall,
                expectedWebJumpRepositoryServiceDeleteByIdsCall,
                expectedResult,
            }) => {
                queryBus.execute = queryBusExecuteResolvedValue;
                webJumpRepositoryService.findByLastSyncDateBefore =
                    webJumpRepositoryFindByLastSyncDateBeforeResolvedValue;
                const webJumpRepositoryServiceFindByIds = jest
                    .spyOn(webJumpRepositoryService, 'findByIds')
                    .mockImplementation(webJumpRepositoryServiceFindByIdsResolvedValue);
                const webJumpRepositoryServiceCreateOrUpdateById = jest.spyOn(
                    webJumpRepositoryService,
                    'createOrUpdateById',
                );
                const webJumpRepositoryServiceDeleteByIds = jest.spyOn(webJumpRepositoryService, 'deleteByIds');
                const eventBusPublish = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(new SyncWebJumpsCommand('transaction-1', 123));

                expect(webJumpRepositoryServiceFindByIds).toHaveBeenCalledTimes(
                    expectedWebJumpRepositoryServiceFindByIdsCall.length,
                );
                for (const item of expectedWebJumpRepositoryServiceFindByIdsCall) {
                    expect(webJumpRepositoryServiceFindByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(webJumpRepositoryServiceCreateOrUpdateById).toHaveBeenCalledTimes(
                    expectedWebJumpRepositoryServiceCreateOrUpdateByIdCall.length,
                );
                for (const item of expectedWebJumpRepositoryServiceCreateOrUpdateByIdCall) {
                    expect(webJumpRepositoryServiceCreateOrUpdateById).toHaveBeenNthCalledWith(
                        item.iter,
                        123,
                        item.entity,
                    );
                }

                expect(webJumpRepositoryServiceDeleteByIds).toHaveBeenCalledTimes(
                    expectedWebJumpRepositoryServiceDeleteByIdsCall.length,
                );
                for (const item of expectedWebJumpRepositoryServiceDeleteByIdsCall) {
                    expect(webJumpRepositoryServiceDeleteByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(result).toEqual(expectedResult);

                expect(eventBusPublish).toHaveBeenCalledWith(
                    expect.objectContaining(<WebJumpsSyncedEvent>{
                        eventType: WebJumpsSyncedEvent.EVENT_TYPE,
                        transactionId: 'transaction-1',
                        payload: {
                            createdWebJumpIds: expectedResult.createdWebJumpIds,
                            updatedWebJumpIds: expectedResult.updatedWebJumpIds,
                            deletedWebJumpIds: expectedResult.deletedWebJumpIds,
                            tenantId: 123,
                        },
                    }),
                );
            },
        );
    });
});

function mockWebJumpEntityCreateMethod() {
    WebJumpEntity.create = jest.fn().mockImplementation((id: number) => {
        return TestHelper.generateMockedWebJumpEntities([id])[0];
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

function mockWebJumpRepositoryService(): WebJumpRepositoryService {
    const service = {} as WebJumpRepositoryService;
    service.findByIds = jest.fn();
    service.createOrUpdateById = jest.fn();
    service.findByLastSyncDateBefore = jest.fn();
    service.deleteByIds = jest.fn();

    return service;
}
