import { CommandBus } from '@nestjs/cqrs';
import { ResourceReportRegistry } from '../../../observability/services/resource-report-registry.service';
import { ScanContext } from '../../../shared/context/scan-context';
import { SyncDiscrepancyByEntityIdCommand } from '../../commands';
import { DiscrepancyEntityType, DiscrepancyScanState, DiscrepancySyncType } from '../../enums';
import { ScanCoordinatorService } from '../../services/scan-coordinator.service';
import { DiscrepancyScannedEvent } from '../discrepancy-scanned.event';
import { SyncAfterDiscrepancyFoundEventHandler } from './sync-after-discrepancy-found.event-handler';

// Simulates a future entity type that has been added to the enum but not yet to
// AUTO_SYNC_ENTITY_TYPES, so the fallback branch stays exercised even though every
// current entity type is currently auto-synced.
const UNLISTED_ENTITY_TYPE = 'not-yet-auto-synced' as DiscrepancyEntityType;

describe('SyncAfterDiscrepancyFoundEventHandler', () => {
    let handler: SyncAfterDiscrepancyFoundEventHandler;
    let commandBus: CommandBus;
    let commandBusExecuteMethod: jest.SpyInstance;

    beforeEach(() => {
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'log').mockImplementation();
        commandBus = mockCommandBus();
        commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        handler = new SyncAfterDiscrepancyFoundEventHandler(
            commandBus,
            new ScanCoordinatorService(
                {
                    discrepancy: {
                        scan: {
                            cycleBudgetInMs: 60000,
                            relationScanConcurrency: 2,
                            autoSyncConcurrency: 3,
                            backgroundQueueCapacity: 5000,
                            distributedLockEnabled: false,
                        },
                    },
                } as never,
                { tryAcquire: () => Promise.resolve({ release: () => Promise.resolve() }) } as never,
                new ResourceReportRegistry(),
            ),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('outcome counting', () => {
        it('counts failures that the by-entity-ID handler reports instead of throwing', async () => {
            commandBusExecuteMethod
                .mockResolvedValueOnce({ synced: true })
                .mockResolvedValueOnce({ synced: false, failureKind: 'Database' })
                .mockResolvedValueOnce({ synced: false, failureKind: 'Database' });

            await handler.handle(
                buildEvent(DiscrepancyEntityType.GroupPolicyMember, {
                    mismatchedIds: [1],
                    onlyInExternalIds: [2],
                    onlyInInternalIds: [3],
                }),
            );

            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('auto-sync group-policy-member: 1 synced, 2 failed (Database x2), 0 skipped'),
            );
        });

        it('does not auto-sync an overview of a scan that did not succeed', async () => {
            const event = buildEvent(DiscrepancyEntityType.User, {
                mismatchedIds: [],
                onlyInExternalIds: [],
                onlyInInternalIds: [1, 2],
            });
            event.payload.discrepancyOverview.state = DiscrepancyScanState.Failed;

            await handler.handle(event);

            expect(commandBusExecuteMethod).not.toHaveBeenCalled();
        });
    });

    describe('scan budget', () => {
        it('starts no auto-sync once the budget of the triggering scan has expired', async () => {
            await ScanContext.runWithBudget({ scanId: 'scan-1', tenantId: 1, budgetInMs: 1 }, async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));

                await handler.handle(
                    buildEvent(DiscrepancyEntityType.User, {
                        mismatchedIds: [1],
                        onlyInExternalIds: [2],
                        onlyInInternalIds: [],
                    }),
                );
            });

            expect(commandBusExecuteMethod).not.toHaveBeenCalled();
        });

        it('syncs normally within the budget', async () => {
            await ScanContext.runWithBudget({ scanId: 'scan-2', tenantId: 1, budgetInMs: 60000 }, () =>
                handler.handle(
                    buildEvent(DiscrepancyEntityType.User, {
                        mismatchedIds: [1],
                        onlyInExternalIds: [2],
                        onlyInInternalIds: [],
                    }),
                ),
            );

            expect(commandBusExecuteMethod).toHaveBeenCalledTimes(2);
        });
    });

    describe('AUTO_SYNC_ENTITY_TYPES (currently every known entity type)', () => {
        it('includes every entity type defined in DiscrepancyEntityType', () => {
            const autoSyncTypes = (
                SyncAfterDiscrepancyFoundEventHandler as unknown as Record<string, DiscrepancyEntityType[]>
            ).AUTO_SYNC_ENTITY_TYPES;

            expect(new Set(autoSyncTypes)).toEqual(new Set(Object.values(DiscrepancyEntityType)));
        });

        it.each(Object.values(DiscrepancyEntityType))(
            'should sync mismatched, external-only, and internal-only ids ExternalToInternal for %s',
            async (entityType) => {
                await handler.handle(
                    buildEvent(entityType, { mismatchedIds: [1], onlyInExternalIds: [2], onlyInInternalIds: [3] }),
                );

                expect(commandBusExecuteMethod).toHaveBeenCalledTimes(3);
                for (const entityId of [1, 2, 3]) {
                    expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                        expect.objectContaining<Partial<SyncDiscrepancyByEntityIdCommand>>({
                            entityId,
                            entityType,
                            syncType: DiscrepancySyncType.ExternalToInternal,
                        }),
                    );
                }
            },
        );

        it('should never use InternalToExternal', async () => {
            await handler.handle(
                buildEvent(DiscrepancyEntityType.JumpClient, {
                    mismatchedIds: [1],
                    onlyInExternalIds: [2],
                    onlyInInternalIds: [3],
                }),
            );

            const calls = commandBusExecuteMethod.mock.calls.map(([cmd]: [SyncDiscrepancyByEntityIdCommand]) => cmd);
            expect(calls.every((cmd) => cmd.syncType === DiscrepancySyncType.ExternalToInternal)).toBe(true);
        });

        it('should deduplicate entity ids that appear in multiple id lists', async () => {
            await handler.handle(
                buildEvent(DiscrepancyEntityType.JumpClient, {
                    mismatchedIds: [1],
                    onlyInExternalIds: [1],
                    onlyInInternalIds: [2],
                }),
            );

            expect(commandBusExecuteMethod).toHaveBeenCalledTimes(2);
        });

        it('should continue syncing remaining entities when some operations fail', async () => {
            commandBusExecuteMethod
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error('Sync failed'))
                .mockResolvedValueOnce(undefined);

            await handler.handle(
                buildEvent(DiscrepancyEntityType.JumpClient, {
                    mismatchedIds: [1],
                    onlyInExternalIds: [2],
                    onlyInInternalIds: [3],
                }),
            );

            expect(commandBusExecuteMethod).toHaveBeenCalledTimes(3);
        });

        it('should log a warning naming the entity type and failure count when some operations fail', async () => {
            commandBusExecuteMethod
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error('Sync failed'))
                .mockResolvedValueOnce(undefined);

            await handler.handle(
                buildEvent(DiscrepancyEntityType.Jumpoint, {
                    mismatchedIds: [1],
                    onlyInExternalIds: [2],
                    onlyInInternalIds: [3],
                }),
            );

            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('auto-sync jumpoint: 2 synced, 1 failed'),
            );
            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Will retry on next scan'));
        });

        it('should log a warning when all operations fail', async () => {
            commandBusExecuteMethod.mockRejectedValue(new Error('Sync failed'));

            await handler.handle(
                buildEvent(DiscrepancyEntityType.JumpClient, {
                    mismatchedIds: [],
                    onlyInExternalIds: [1, 2],
                    onlyInInternalIds: [],
                }),
            );

            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('0 synced, 2 failed'));
        });

        it('should not warn when all sync operations succeed', async () => {
            await handler.handle(
                buildEvent(DiscrepancyEntityType.JumpClient, {
                    mismatchedIds: [1],
                    onlyInExternalIds: [2],
                    onlyInInternalIds: [3],
                }),
            );

            expect(console.warn).not.toHaveBeenCalled();
        });

        it('should return immediately without calling commandBus when no entity ids exist', async () => {
            await handler.handle(
                buildEvent(DiscrepancyEntityType.JumpClient, {
                    mismatchedIds: [],
                    onlyInExternalIds: [],
                    onlyInInternalIds: [],
                }),
            );

            expect(commandBusExecuteMethod).not.toHaveBeenCalled();
        });

        it('should pass transactionId and tenantId to all sync commands', async () => {
            await handler.handle(
                buildEvent(
                    DiscrepancyEntityType.Jumpoint,
                    { mismatchedIds: [5], onlyInExternalIds: [], onlyInInternalIds: [] },
                    { transactionId: 'tx-parallel-123', tenantId: 42 },
                ),
            );

            expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                expect.objectContaining<Partial<SyncDiscrepancyByEntityIdCommand>>({
                    transactionId: 'tx-parallel-123',
                    tenantId: 42,
                }),
            );
        });
    });

    describe('entity types not (yet) in AUTO_SYNC_ENTITY_TYPES (fallback for future entity types)', () => {
        it('should sync onlyInExternalIds ExternalToInternal', async () => {
            await handler.handle(
                buildEvent(UNLISTED_ENTITY_TYPE, {
                    mismatchedIds: [],
                    onlyInExternalIds: [10, 20],
                    onlyInInternalIds: [],
                }),
            );

            expect(commandBusExecuteMethod).toHaveBeenCalledTimes(2);
            for (const entityId of [10, 20]) {
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    expect.objectContaining<Partial<SyncDiscrepancyByEntityIdCommand>>({
                        entityId,
                        syncType: DiscrepancySyncType.ExternalToInternal,
                    }),
                );
            }
        });

        it.skip('should sync onlyInInternalIds InternalToExternal once that path is enabled', async () => {
            await handler.handle(
                buildEvent(UNLISTED_ENTITY_TYPE, {
                    mismatchedIds: [],
                    onlyInExternalIds: [],
                    onlyInInternalIds: [30, 40],
                }),
            );

            expect(commandBusExecuteMethod).toHaveBeenCalledTimes(2);
            expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                expect.objectContaining<Partial<SyncDiscrepancyByEntityIdCommand>>({
                    entityId: 30,
                    syncType: DiscrepancySyncType.InternalToExternal,
                }),
            );
        });

        it('should not execute any command for mismatchedIds', async () => {
            await handler.handle(
                buildEvent(UNLISTED_ENTITY_TYPE, {
                    mismatchedIds: [1, 2, 3],
                    onlyInExternalIds: [],
                    onlyInInternalIds: [],
                }),
            );

            expect(commandBusExecuteMethod).not.toHaveBeenCalled();
        });

        it('should not execute any command for onlyInInternalIds (not yet implemented)', async () => {
            await handler.handle(
                buildEvent(UNLISTED_ENTITY_TYPE, {
                    mismatchedIds: [],
                    onlyInExternalIds: [],
                    onlyInInternalIds: [30, 40],
                }),
            );

            expect(commandBusExecuteMethod).not.toHaveBeenCalled();
        });

        it('should only sync onlyInExternalIds when mismatchedIds and onlyInInternalIds are also present', async () => {
            await handler.handle(
                buildEvent(UNLISTED_ENTITY_TYPE, {
                    mismatchedIds: [99],
                    onlyInExternalIds: [10],
                    onlyInInternalIds: [20],
                }),
            );

            expect(commandBusExecuteMethod).toHaveBeenCalledTimes(1);
            expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                expect.objectContaining<Partial<SyncDiscrepancyByEntityIdCommand>>({
                    entityId: 10,
                    syncType: DiscrepancySyncType.ExternalToInternal,
                }),
            );
        });

        it('should not execute any command when all lists are empty', async () => {
            await handler.handle(
                buildEvent(UNLISTED_ENTITY_TYPE, { mismatchedIds: [], onlyInExternalIds: [], onlyInInternalIds: [] }),
            );

            expect(commandBusExecuteMethod).not.toHaveBeenCalled();
        });

        it('should deduplicate onlyInExternalIds', async () => {
            await handler.handle(
                buildEvent(UNLISTED_ENTITY_TYPE, {
                    mismatchedIds: [],
                    onlyInExternalIds: [10, 10, 20],
                    onlyInInternalIds: [],
                }),
            );

            expect(commandBusExecuteMethod).toHaveBeenCalledTimes(2);
        });

        it('should continue syncing remaining onlyInExternalIds when one command fails', async () => {
            commandBusExecuteMethod
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error('Sync failed'))
                .mockResolvedValueOnce(undefined);

            await handler.handle(
                buildEvent(UNLISTED_ENTITY_TYPE, {
                    mismatchedIds: [],
                    onlyInExternalIds: [10, 20, 30],
                    onlyInInternalIds: [],
                }),
            );

            expect(commandBusExecuteMethod).toHaveBeenCalledTimes(3);
            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('2 synced, 1 failed'));
        });

        it('should not warn when all onlyInExternalIds sync successfully', async () => {
            await handler.handle(
                buildEvent(UNLISTED_ENTITY_TYPE, {
                    mismatchedIds: [],
                    onlyInExternalIds: [10],
                    onlyInInternalIds: [],
                }),
            );

            expect(console.warn).not.toHaveBeenCalled();
        });

        it('should pass transactionId and tenantId to the command', async () => {
            await handler.handle(
                buildEvent(
                    UNLISTED_ENTITY_TYPE,
                    { mismatchedIds: [], onlyInExternalIds: [5], onlyInInternalIds: [] },
                    { transactionId: 'tx-abc', tenantId: 7 },
                ),
            );

            expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                expect.objectContaining<Partial<SyncDiscrepancyByEntityIdCommand>>({
                    transactionId: 'tx-abc',
                    tenantId: 7,
                }),
            );
        });
    });
});

function mockCommandBus(): CommandBus {
    const bus = {} as CommandBus;
    bus.execute = jest.fn().mockResolvedValue(undefined);
    return bus;
}

function buildEvent(
    entityType: DiscrepancyEntityType,
    ids: { mismatchedIds: number[]; onlyInExternalIds: number[]; onlyInInternalIds: number[] },
    options: { transactionId?: string; tenantId?: number } = {},
): DiscrepancyScannedEvent {
    return new DiscrepancyScannedEvent(options.transactionId ?? 'transaction-1', {
        tenantId: options.tenantId ?? 1,
        discrepancyOverview: {
            entityType,
            totalBtData: 0,
            totalDbData: 0,
            identicalIds: [],
            mismatchedIds: ids.mismatchedIds,
            onlyInExternalIds: ids.onlyInExternalIds,
            onlyInInternalIds: ids.onlyInInternalIds,
        },
    });
}
