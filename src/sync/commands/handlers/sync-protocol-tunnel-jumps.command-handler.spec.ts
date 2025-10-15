import { EventBus, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { ProtocolTunnelJumpRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/dtos/outputs';
import { JumpGroupEntity } from '../../../jump-group/repositories/entities';
import {
    ProtocolTunnelJumpsSyncedEvent,
    ProtocolTunnelJumpsSyncFailedEvent,
} from '../../../jump-item/protocol-tunnel-jump/events';
import { ProtocolTunnelJumpEntity } from '../../../jump-item/protocol-tunnel-jump/repositories/entities';
import { ProtocolTunnelJumpRepositoryService } from '../../../jump-item/protocol-tunnel-jump/repositories/services/protocol-tunnel-jump-repository.service';
import { JumpointEntity } from '../../../jumpoint/repositories/entities';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { SyncProtocolTunnelJumpsCommand } from '../sync-protocol-tunnel-jumps.command';
import { SyncProtocolTunnelJumpsCommandHandler } from './sync-protocol-tunnel-jumps.command-handler';

abstract class TestHelper {
    public static generateMockedProtocolTunnelJumpRetrievedDtoOutputs(
        ids: number[],
    ): ProtocolTunnelJumpRetrievedDtoOutput[] {
        return ids.map((id) => ({
            id,
            name: `protocol-tunnel-jump-${id}`,
            hostname: `hostname-${id}`,
            jumpGroupId: id,
            jumpointId: id,
        }));
    }

    public static generateMockedProtocolTunnelJumpEntities(ids: number[]): ProtocolTunnelJumpEntity[] {
        return ids.map((id) => ({
            id,
            name: `protocol-tunnel-jump-${id}`,
            hostname: `hostname-${id}`,
            jumpGroupId: id,
            jumpointId: id,
            lastSyncDate: new Date('2025-01-01T00:00:00Z'),
            jumpoint: {} as JumpointEntity,
            jumpGroup: {} as JumpGroupEntity,
        }));
    }
}

describe('SyncProtocolTunnelJumpsCommandHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService;
    let handler: SyncProtocolTunnelJumpsCommandHandler;

    beforeEach(() => {
        mockProtocolTunnelJumpEntityCreateMethod();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        protocolTunnelJumpRepositoryService = mockProtocolTunnelJumpRepositoryService();
        handler = new SyncProtocolTunnelJumpsCommandHandler(
            appConfigService,
            queryBus,
            eventBus,
            protocolTunnelJumpRepositoryService,
        );
    });

    describe('execute', () => {
        it('should publish an event and throw an error when an error occurs', async () => {
            const error = new Error('Test error');
            const eventBusPublish = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Test error');

            queryBus.execute = jest.fn().mockRejectedValue(error);

            await expect(handler.execute(new SyncProtocolTunnelJumpsCommand('transaction-1', 123))).rejects.toThrow(
                error,
            );

            expect(eventBusPublish).toHaveBeenCalledWith(
                expect.objectContaining(<ProtocolTunnelJumpsSyncFailedEvent>{
                    eventType: ProtocolTunnelJumpsSyncFailedEvent.EVENT_TYPE,
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
                    .mockResolvedValueOnce(TestHelper.generateMockedProtocolTunnelJumpRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValueOnce(TestHelper.generateMockedProtocolTunnelJumpRetrievedDtoOutputs([3, 4]))
                    .mockResolvedValue(TestHelper.generateMockedProtocolTunnelJumpRetrievedDtoOutputs([3, 4])), // BT return repeating data when pagination limit is exceeded
                protocolTunnelJumpRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedProtocolTunnelJumpEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedProtocolTunnelJumpEntities([7, 8]))
                    .mockResolvedValue(TestHelper.generateMockedProtocolTunnelJumpEntities([])),
                protocolTunnelJumpRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedProtocolTunnelJumpEntities([1, 3])),
                expectedProtocolTunnelJumpRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3, 4],
                    },
                ],
                expectedProtocolTunnelJumpRepositoryServiceCreateOrUpdateByIdCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedProtocolTunnelJumpEntities([2])[0],
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedProtocolTunnelJumpEntities([1])[0],
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedProtocolTunnelJumpEntities([4])[0],
                    },
                    {
                        iter: 4,
                        entity: TestHelper.generateMockedProtocolTunnelJumpEntities([3])[0],
                    },
                ],
                expectedProtocolTunnelJumpRepositoryServiceDeleteByIdsCall: [
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
                    createdProtocolTunnelJumpIds: [2, 4],
                    updatedProtocolTunnelJumpIds: [1, 3],
                    deletedProtocolTunnelJumpIds: [5, 6, 7, 8],
                },
            },
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedProtocolTunnelJumpRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValue(TestHelper.generateMockedProtocolTunnelJumpRetrievedDtoOutputs([3])),
                protocolTunnelJumpRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedProtocolTunnelJumpEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedProtocolTunnelJumpEntities([7])),
                protocolTunnelJumpRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedProtocolTunnelJumpEntities([1, 3])),
                expectedProtocolTunnelJumpRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3],
                    },
                ],
                expectedProtocolTunnelJumpRepositoryServiceCreateOrUpdateByIdCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedProtocolTunnelJumpEntities([2])[0],
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedProtocolTunnelJumpEntities([1])[0],
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedProtocolTunnelJumpEntities([3])[0],
                    },
                ],
                expectedProtocolTunnelJumpRepositoryServiceDeleteByIdsCall: [
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
                    createdProtocolTunnelJumpIds: [2],
                    updatedProtocolTunnelJumpIds: [1, 3],
                    deletedProtocolTunnelJumpIds: [5, 6, 7],
                },
            },
        ])(
            'should return, call method and publish event as expected',
            async ({
                queryBusExecuteResolvedValue,
                protocolTunnelJumpRepositoryFindByLastSyncDateBeforeResolvedValue,
                protocolTunnelJumpRepositoryServiceFindByIdsResolvedValue,
                expectedProtocolTunnelJumpRepositoryServiceFindByIdsCall,
                expectedProtocolTunnelJumpRepositoryServiceCreateOrUpdateByIdCall,
                expectedProtocolTunnelJumpRepositoryServiceDeleteByIdsCall,
                expectedResult,
            }) => {
                queryBus.execute = queryBusExecuteResolvedValue;
                protocolTunnelJumpRepositoryService.findByLastSyncDateBefore =
                    protocolTunnelJumpRepositoryFindByLastSyncDateBeforeResolvedValue;
                const protocolTunnelJumpRepositoryServiceFindByIds = jest
                    .spyOn(protocolTunnelJumpRepositoryService, 'findByIds')
                    .mockImplementation(protocolTunnelJumpRepositoryServiceFindByIdsResolvedValue);
                const protocolTunnelJumpRepositoryServiceCreateOrUpdateById = jest.spyOn(
                    protocolTunnelJumpRepositoryService,
                    'createOrUpdateById',
                );
                const protocolTunnelJumpRepositoryServiceDeleteByIds = jest.spyOn(
                    protocolTunnelJumpRepositoryService,
                    'deleteByIds',
                );
                const eventBusPublish = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(new SyncProtocolTunnelJumpsCommand('transaction-1', 123));

                expect(protocolTunnelJumpRepositoryServiceFindByIds).toHaveBeenCalledTimes(
                    expectedProtocolTunnelJumpRepositoryServiceFindByIdsCall.length,
                );
                for (const item of expectedProtocolTunnelJumpRepositoryServiceFindByIdsCall) {
                    expect(protocolTunnelJumpRepositoryServiceFindByIds).toHaveBeenNthCalledWith(
                        item.iter,
                        123,
                        item.ids,
                    );
                }

                expect(protocolTunnelJumpRepositoryServiceCreateOrUpdateById).toHaveBeenCalledTimes(
                    expectedProtocolTunnelJumpRepositoryServiceCreateOrUpdateByIdCall.length,
                );
                for (const item of expectedProtocolTunnelJumpRepositoryServiceCreateOrUpdateByIdCall) {
                    expect(protocolTunnelJumpRepositoryServiceCreateOrUpdateById).toHaveBeenNthCalledWith(
                        item.iter,
                        123,
                        item.entity,
                    );
                }

                expect(protocolTunnelJumpRepositoryServiceDeleteByIds).toHaveBeenCalledTimes(
                    expectedProtocolTunnelJumpRepositoryServiceDeleteByIdsCall.length,
                );
                for (const item of expectedProtocolTunnelJumpRepositoryServiceDeleteByIdsCall) {
                    expect(protocolTunnelJumpRepositoryServiceDeleteByIds).toHaveBeenNthCalledWith(
                        item.iter,
                        123,
                        item.ids,
                    );
                }

                expect(result).toEqual(expectedResult);

                expect(eventBusPublish).toHaveBeenCalledWith(
                    expect.objectContaining(<ProtocolTunnelJumpsSyncedEvent>{
                        eventType: ProtocolTunnelJumpsSyncedEvent.EVENT_TYPE,
                        transactionId: 'transaction-1',
                        payload: {
                            createdProtocolTunnelJumpIds: expectedResult.createdProtocolTunnelJumpIds,
                            updatedProtocolTunnelJumpIds: expectedResult.updatedProtocolTunnelJumpIds,
                            deletedProtocolTunnelJumpIds: expectedResult.deletedProtocolTunnelJumpIds,
                            tenantId: 123,
                        },
                    }),
                );
            },
        );
    });
});

function mockProtocolTunnelJumpEntityCreateMethod() {
    ProtocolTunnelJumpEntity.create = jest.fn().mockImplementation((id: number) => {
        return TestHelper.generateMockedProtocolTunnelJumpEntities([id])[0];
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

function mockProtocolTunnelJumpRepositoryService(): ProtocolTunnelJumpRepositoryService {
    const service = {} as ProtocolTunnelJumpRepositoryService;
    service.findByIds = jest.fn();
    service.createOrUpdateById = jest.fn();
    service.findByLastSyncDateBefore = jest.fn();
    service.deleteByIds = jest.fn();

    return service;
}
