import { EventBus, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { JumpointRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jumpoint/dtos/outputs';
import { JumpointPlatformType as BTJumpointPlatformType } from '../../../beyondtrust-pra-conf-api/jumpoint/enums';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpointPlatformType } from '../../enums';
import { JumpointsSyncedEvent, JumpointsSyncFailedEvent } from '../../events';
import { JumpointEntity } from '../../repositories/entities';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { SyncJumpointsCommand } from '../sync-jumpoints.command';
import { SyncJumpointsCommandHandler } from './sync-jumpoints.command-handler';

abstract class TestHelper {
    public static generateMockedJumpointRetrievedDtoOutputs(ids: number[]): JumpointRetrievedDtoOutput[] {
        return ids.map((id) => ({
            id,
            name: `jumpoint-${id}`,
            platform: BTJumpointPlatformType.LinuxX86,
        }));
    }

    public static generateMockedJumpointEntities(ids: number[]): JumpointEntity[] {
        return ids.map((id) => ({
            id,
            name: `jumpoint-${id}`,
            platformType: JumpointPlatformType.LinuxX86,
            lastSyncDate: new Date('2025-01-01T00:00:00Z'),
            groupPolicyJumpoints: [],
            protocolTunnelJumps: [],
            remoteRdps: [],
            remoteVncs: [],
            shellJumps: [],
            webJumps: [],
        }));
    }
}

describe('SyncJumpointsCommandHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let jumpointRepositoryService: JumpointRepositoryService;
    let handler: SyncJumpointsCommandHandler;

    beforeEach(() => {
        mockJumpointEntityCreateMethod();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        jumpointRepositoryService = mockJumpointRepositoryService();
        handler = new SyncJumpointsCommandHandler(appConfigService, queryBus, eventBus, jumpointRepositoryService);
    });

    describe('execute', () => {
        it('should publish an event and throw an error when an error occurs', async () => {
            const error = new Error('Test error');
            const eventBusPublish = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Test error');

            queryBus.execute = jest.fn().mockRejectedValue(error);

            await expect(handler.execute(new SyncJumpointsCommand('transaction-1', 123))).rejects.toThrow(error);

            expect(eventBusPublish).toHaveBeenCalledWith(
                expect.objectContaining(<JumpointsSyncFailedEvent>{
                    eventType: JumpointsSyncFailedEvent.EVENT_TYPE,
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
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpointRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpointRetrievedDtoOutputs([3, 4]))
                    .mockResolvedValue(TestHelper.generateMockedJumpointRetrievedDtoOutputs([3, 4])), // BT return repeating data when pagination limit is exceeded
                jumpointRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpointEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpointEntities([7, 8]))
                    .mockResolvedValue(TestHelper.generateMockedJumpointEntities([])),
                jumpointRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedJumpointEntities([1, 3])),
                expectedJumpointRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3, 4],
                    },
                ],
                expectedJumpointRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedJumpointEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedJumpointEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedJumpointEntities([4]),
                    },
                    {
                        iter: 4,
                        entity: TestHelper.generateMockedJumpointEntities([3]),
                    },
                ],
                expectedJumpointRepositoryServiceDeleteByIdsCall: [
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
                    createdJumpointIds: [2, 4],
                    updatedJumpointIds: [1, 3],
                    deletedJumpointIds: [5, 6, 7, 8],
                },
            },
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpointRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValue(TestHelper.generateMockedJumpointRetrievedDtoOutputs([3])),
                jumpointRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpointEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedJumpointEntities([7])),
                jumpointRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedJumpointEntities([1, 3])),
                expectedJumpointRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3],
                    },
                ],
                expectedJumpointRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedJumpointEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedJumpointEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedJumpointEntities([3]),
                    },
                ],
                expectedJumpointRepositoryServiceDeleteByIdsCall: [
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
                    createdJumpointIds: [2],
                    updatedJumpointIds: [1, 3],
                    deletedJumpointIds: [5, 6, 7],
                },
            },
        ])(
            'should return, call method and publish event as expected',
            async ({
                queryBusExecuteResolvedValue,
                jumpointRepositoryFindByLastSyncDateBeforeResolvedValue,
                jumpointRepositoryServiceFindByIdsResolvedValue,
                expectedJumpointRepositoryServiceFindByIdsCall,
                expectedJumpointRepositoryServiceCreateOrUpdateByIdsCall,
                expectedJumpointRepositoryServiceDeleteByIdsCall,
                expectedResult,
            }) => {
                queryBus.execute = queryBusExecuteResolvedValue;
                jumpointRepositoryService.findByLastSyncDateBefore =
                    jumpointRepositoryFindByLastSyncDateBeforeResolvedValue;
                const jumpointRepositoryServiceFindByIds = jest
                    .spyOn(jumpointRepositoryService, 'findByIds')
                    .mockImplementation(jumpointRepositoryServiceFindByIdsResolvedValue);
                const jumpointRepositoryServiceCreateOrUpdateByIds = jest.spyOn(
                    jumpointRepositoryService,
                    'createOrUpdateByIds',
                );
                const jumpointRepositoryServiceDeleteByIds = jest.spyOn(jumpointRepositoryService, 'deleteByIds');
                const eventBusPublish = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(new SyncJumpointsCommand('transaction-1', 123));

                expect(jumpointRepositoryServiceFindByIds).toHaveBeenCalledTimes(
                    expectedJumpointRepositoryServiceFindByIdsCall.length,
                );
                for (const item of expectedJumpointRepositoryServiceFindByIdsCall) {
                    expect(jumpointRepositoryServiceFindByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(jumpointRepositoryServiceCreateOrUpdateByIds).toHaveBeenCalledTimes(
                    expectedJumpointRepositoryServiceCreateOrUpdateByIdsCall.length,
                );
                for (const item of expectedJumpointRepositoryServiceCreateOrUpdateByIdsCall) {
                    expect(jumpointRepositoryServiceCreateOrUpdateByIds).toHaveBeenNthCalledWith(
                        item.iter,
                        123,
                        item.entity,
                    );
                }

                expect(jumpointRepositoryServiceDeleteByIds).toHaveBeenCalledTimes(
                    expectedJumpointRepositoryServiceDeleteByIdsCall.length,
                );
                for (const item of expectedJumpointRepositoryServiceDeleteByIdsCall) {
                    expect(jumpointRepositoryServiceDeleteByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(result).toEqual(expectedResult);

                expect(eventBusPublish).toHaveBeenCalledWith(
                    expect.objectContaining(<JumpointsSyncedEvent>{
                        eventType: JumpointsSyncedEvent.EVENT_TYPE,
                        transactionId: 'transaction-1',
                        payload: {
                            tenantId: 123,
                            createdJumpointIds: expectedResult.createdJumpointIds,
                            updatedJumpointIds: expectedResult.updatedJumpointIds,
                            deletedJumpointIds: expectedResult.deletedJumpointIds,
                        },
                    }),
                );
            },
        );
    });
});

function mockJumpointEntityCreateMethod() {
    JumpointEntity.create = jest.fn().mockImplementation((id: number) => {
        return TestHelper.generateMockedJumpointEntities([id])[0];
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

function mockJumpointRepositoryService(): JumpointRepositoryService {
    const service = {} as JumpointRepositoryService;
    service.findByIds = jest.fn();
    service.createOrUpdateByIds = jest.fn();
    service.findByLastSyncDateBefore = jest.fn();
    service.deleteByIds = jest.fn();

    return service;
}
