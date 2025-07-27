import { EventBus, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { ShellJumpRetrievedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/dtos/outputs';
import { ShellJumpProtocolType as BTShellJumpProtocolType } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/enums';
import { JumpointEntity } from '../../../../jumpoint/repositories/entities';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { ShellJumpProtocolType } from '../../enums';
import { ShellJumpsSyncedEvent, ShellJumpsSyncFailedEvent } from '../../events';
import { ShellJumpEntity } from '../../repositories/entities';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { SyncShellJumpsCommand } from '../sync-shell-jumps.command';
import { SyncShellJumpsCommandHandler } from './sync-shell-jumps.command-handler';

abstract class TestHelper {
    public static generateMockedShellJumpRetrievedDtoOutputs(ids: number[]): ShellJumpRetrievedDtoOutput[] {
        return ids.map((id) => ({
            id,
            name: `shell-jump-${id}`,
            hostname: `hostname-${id}`,
            jumpGroupId: id,
            jumpointId: id,
            protocol: BTShellJumpProtocolType.SSH,
        }));
    }

    public static generateMockedShellJumpEntities(ids: number[]): ShellJumpEntity[] {
        return ids.map((id) => ({
            id,
            name: `shell-jump-${id}`,
            hostname: `hostname-${id}`,
            jumpGroupId: id,
            jumpointId: id,
            protocolType: ShellJumpProtocolType.SSH,
            lastSyncDate: new Date('2025-01-01T00:00:00Z'),
            jumpoint: {} as JumpointEntity,
        }));
    }
}

describe('SyncShellJumpsCommandHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let shellJumpRepositoryService: ShellJumpRepositoryService;
    let handler: SyncShellJumpsCommandHandler;

    beforeEach(() => {
        mockShellJumpEntityCreateMethod();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        shellJumpRepositoryService = mockShellJumpRepositoryService();
        handler = new SyncShellJumpsCommandHandler(appConfigService, queryBus, eventBus, shellJumpRepositoryService);
    });

    describe('execute', () => {
        it('should publish an event and throw an error when an error occurs', async () => {
            const error = new Error('Test error');
            const eventBusPublish = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Test error');

            queryBus.execute = jest.fn().mockRejectedValue(error);

            await expect(handler.execute(new SyncShellJumpsCommand('transaction-1'))).rejects.toThrow(error);

            expect(eventBusPublish).toHaveBeenCalledWith(
                expect.objectContaining(<ShellJumpsSyncFailedEvent>{
                    eventType: ShellJumpsSyncFailedEvent.EVENT_TYPE,
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
                    .mockResolvedValueOnce(TestHelper.generateMockedShellJumpRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValueOnce(TestHelper.generateMockedShellJumpRetrievedDtoOutputs([3, 4]))
                    .mockResolvedValue(TestHelper.generateMockedShellJumpRetrievedDtoOutputs([3, 4])), // BT return repeating data when pagination limit is exceeded
                shellJumpRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedShellJumpEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedShellJumpEntities([7, 8]))
                    .mockResolvedValue(TestHelper.generateMockedShellJumpEntities([])),
                shellJumpRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedShellJumpEntities([1, 3])),
                expectedShellJumpRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3, 4],
                    },
                ],
                expectedShellJumpRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedShellJumpEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedShellJumpEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedShellJumpEntities([4]),
                    },
                    {
                        iter: 4,
                        entity: TestHelper.generateMockedShellJumpEntities([3]),
                    },
                ],
                expectedShellJumpRepositoryServiceDeleteByIdsCall: [
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
                    createdShellJumpIds: [2, 4],
                    updatedShellJumpIds: [1, 3],
                    deletedShellJumpIds: [5, 6, 7, 8],
                },
            },
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedShellJumpRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValue(TestHelper.generateMockedShellJumpRetrievedDtoOutputs([3])),
                shellJumpRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedShellJumpEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedShellJumpEntities([7])),
                shellJumpRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedShellJumpEntities([1, 3])),
                expectedShellJumpRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3],
                    },
                ],
                expectedShellJumpRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedShellJumpEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedShellJumpEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedShellJumpEntities([3]),
                    },
                ],
                expectedShellJumpRepositoryServiceDeleteByIdsCall: [
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
                    createdShellJumpIds: [2],
                    updatedShellJumpIds: [1, 3],
                    deletedShellJumpIds: [5, 6, 7],
                },
            },
        ])(
            'should return, call method and publish event as expected',
            async ({
                queryBusExecuteResolvedValue,
                shellJumpRepositoryFindByLastSyncDateBeforeResolvedValue,
                shellJumpRepositoryServiceFindByIdsResolvedValue,
                expectedShellJumpRepositoryServiceFindByIdsCall,
                expectedShellJumpRepositoryServiceCreateOrUpdateByIdsCall,
                expectedShellJumpRepositoryServiceDeleteByIdsCall,
                expectedResult,
            }) => {
                queryBus.execute = queryBusExecuteResolvedValue;
                shellJumpRepositoryService.findByLastSyncDateBefore =
                    shellJumpRepositoryFindByLastSyncDateBeforeResolvedValue;
                const shellJumpRepositoryServiceFindByIds = jest
                    .spyOn(shellJumpRepositoryService, 'findByIds')
                    .mockImplementation(shellJumpRepositoryServiceFindByIdsResolvedValue);
                const shellJumpRepositoryServiceCreateOrUpdateByIds = jest.spyOn(
                    shellJumpRepositoryService,
                    'createOrUpdateByIds',
                );
                const shellJumpRepositoryServiceDeleteByIds = jest.spyOn(shellJumpRepositoryService, 'deleteByIds');
                const eventBusPublish = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(new SyncShellJumpsCommand('transaction-1'));

                expect(shellJumpRepositoryServiceFindByIds).toHaveBeenCalledTimes(
                    expectedShellJumpRepositoryServiceFindByIdsCall.length,
                );
                for (const item of expectedShellJumpRepositoryServiceFindByIdsCall) {
                    expect(shellJumpRepositoryServiceFindByIds).toHaveBeenNthCalledWith(item.iter, item.ids);
                }

                expect(shellJumpRepositoryServiceCreateOrUpdateByIds).toHaveBeenCalledTimes(
                    expectedShellJumpRepositoryServiceCreateOrUpdateByIdsCall.length,
                );
                for (const item of expectedShellJumpRepositoryServiceCreateOrUpdateByIdsCall) {
                    expect(shellJumpRepositoryServiceCreateOrUpdateByIds).toHaveBeenNthCalledWith(
                        item.iter,
                        item.entity,
                    );
                }

                expect(shellJumpRepositoryServiceDeleteByIds).toHaveBeenCalledTimes(
                    expectedShellJumpRepositoryServiceDeleteByIdsCall.length,
                );
                for (const item of expectedShellJumpRepositoryServiceDeleteByIdsCall) {
                    expect(shellJumpRepositoryServiceDeleteByIds).toHaveBeenNthCalledWith(item.iter, item.ids);
                }

                expect(result).toEqual(expectedResult);

                expect(eventBusPublish).toHaveBeenCalledWith(
                    expect.objectContaining(<ShellJumpsSyncedEvent>{
                        eventType: ShellJumpsSyncedEvent.EVENT_TYPE,
                        transactionId: 'transaction-1',
                        payload: {
                            createdShellJumpIds: expectedResult.createdShellJumpIds,
                            updatedShellJumpIds: expectedResult.updatedShellJumpIds,
                            deletedShellJumpIds: expectedResult.deletedShellJumpIds,
                        },
                    }),
                );
            },
        );
    });
});

function mockShellJumpEntityCreateMethod() {
    ShellJumpEntity.create = jest.fn().mockImplementation((id: number) => {
        return TestHelper.generateMockedShellJumpEntities([id])[0];
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

function mockShellJumpRepositoryService(): ShellJumpRepositoryService {
    const service = {} as ShellJumpRepositoryService;
    service.findByIds = jest.fn();
    service.createOrUpdateByIds = jest.fn();
    service.createOrUpdateByIds = jest.fn();
    service.findByLastSyncDateBefore = jest.fn();
    service.deleteByIds = jest.fn();

    return service;
}
