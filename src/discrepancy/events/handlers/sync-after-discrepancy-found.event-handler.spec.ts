import { CommandBus } from '@nestjs/cqrs';
import { SyncDiscrepancyByEntityIdCommand } from '../../commands';
import { DiscrepancyEntityType, DiscrepancySyncType } from '../../enums';
import { DiscrepancyScannedEvent } from '../discrepancy-scanned.event';
import { SyncAfterDiscrepancyFoundEventHandler } from './sync-after-discrepancy-found.event-handler';

describe('SyncAfterDiscrepancyFoundEventHandler', () => {
    let handler: SyncAfterDiscrepancyFoundEventHandler;
    let commandBus: CommandBus;

    beforeEach(() => {
        jest.spyOn(console, 'warn').mockImplementation();
        commandBus = mockCommandBus();
        handler = new SyncAfterDiscrepancyFoundEventHandler(commandBus);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handle', () => {
        describe('AUTO_SYNC_ENTITY_TYPES (full sync, ExternalToInternal)', () => {
            it.each([
                DiscrepancyEntityType.JumpClient,
                DiscrepancyEntityType.JumpClientInstaller,
                DiscrepancyEntityType.Jumpoint,
                DiscrepancyEntityType.GroupPolicyJumpoint,
                DiscrepancyEntityType.SessionPolicy,
            ])('should sync all discrepancy types ExternalToInternal for %s', async (entityType) => {
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');

                await handler.handle(
                    buildEvent(entityType, { mismatchedIds: [1], onlyInExternalIds: [2], onlyInInternalIds: [3] }),
                );

                expect(commandBusExecuteMethod).toHaveBeenCalledTimes(3);
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    expect.objectContaining<Partial<SyncDiscrepancyByEntityIdCommand>>({
                        entityId: 1,
                        entityType,
                        syncType: DiscrepancySyncType.ExternalToInternal,
                    }),
                );
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    expect.objectContaining<Partial<SyncDiscrepancyByEntityIdCommand>>({
                        entityId: 2,
                        entityType,
                        syncType: DiscrepancySyncType.ExternalToInternal,
                    }),
                );
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    expect.objectContaining<Partial<SyncDiscrepancyByEntityIdCommand>>({
                        entityId: 3,
                        entityType,
                        syncType: DiscrepancySyncType.ExternalToInternal,
                    }),
                );
            });

            it.each([
                DiscrepancyEntityType.JumpClient,
                DiscrepancyEntityType.JumpClientInstaller,
                DiscrepancyEntityType.Jumpoint,
                DiscrepancyEntityType.GroupPolicyJumpoint,
                DiscrepancyEntityType.SessionPolicy,
            ])('should never use InternalToExternal for %s', async (entityType) => {
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');

                await handler.handle(
                    buildEvent(entityType, { mismatchedIds: [1], onlyInExternalIds: [2], onlyInInternalIds: [3] }),
                );

                const calls = (commandBusExecuteMethod.mock.calls as [SyncDiscrepancyByEntityIdCommand][]).map(
                    ([cmd]) => cmd,
                );
                expect(calls.every((cmd) => cmd.syncType === DiscrepancySyncType.ExternalToInternal)).toBe(true);
            });

            it('should deduplicate entity ids across discrepancy types', async () => {
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');

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
                // Arrange: middle command rejects, but Promise.allSettled ensures all 3 are attempted
                const commandBusExecuteMethod = jest
                    .spyOn(commandBus, 'execute')
                    .mockResolvedValueOnce(undefined)
                    .mockRejectedValueOnce(new Error('Sync failed'))
                    .mockResolvedValueOnce(undefined);

                // Act
                await handler.handle(
                    buildEvent(DiscrepancyEntityType.JumpClient, {
                        mismatchedIds: [1],
                        onlyInExternalIds: [2],
                        onlyInInternalIds: [3],
                    }),
                );

                // Assert – all 3 attempted despite the middle failure
                expect(commandBusExecuteMethod).toHaveBeenCalledTimes(3);
            });

            it('should log a warning when some sync operations fail', async () => {
                // Arrange
                jest.spyOn(commandBus, 'execute')
                    .mockResolvedValueOnce(undefined)
                    .mockRejectedValueOnce(new Error('Sync failed'))
                    .mockResolvedValueOnce(undefined);

                // Act
                await handler.handle(
                    buildEvent(DiscrepancyEntityType.Jumpoint, {
                        mismatchedIds: [1],
                        onlyInExternalIds: [2],
                        onlyInInternalIds: [3],
                    }),
                );

                // Assert
                expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('1/3 auto-sync operations failed'));
                expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Will retry on next scan'));
            });

            it('should not warn when all sync operations succeed', async () => {
                // Arrange
                jest.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

                // Act
                await handler.handle(
                    buildEvent(DiscrepancyEntityType.JumpClient, {
                        mismatchedIds: [1],
                        onlyInExternalIds: [2],
                        onlyInInternalIds: [3],
                    }),
                );

                // Assert
                expect(console.warn).not.toHaveBeenCalled();
            });

            it('should return immediately without calling commandBus when no entity ids exist', async () => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');

                // Act
                await handler.handle(
                    buildEvent(DiscrepancyEntityType.JumpClient, {
                        mismatchedIds: [],
                        onlyInExternalIds: [],
                        onlyInInternalIds: [],
                    }),
                );

                // Assert – early exit path: pLimit never reached
                expect(commandBusExecuteMethod).not.toHaveBeenCalled();
            });

            it('should pass transactionId and tenantId to all sync commands', async () => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');

                // Act
                await handler.handle(
                    buildEvent(
                        DiscrepancyEntityType.Jumpoint,
                        { mismatchedIds: [5], onlyInExternalIds: [], onlyInInternalIds: [] },
                        { transactionId: 'tx-parallel-123', tenantId: 42 },
                    ),
                );

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    expect.objectContaining<Partial<SyncDiscrepancyByEntityIdCommand>>({
                        transactionId: 'tx-parallel-123',
                        tenantId: 42,
                    }),
                );
            });
        });

        describe('all other entity types', () => {
            it.skip('should sync onlyInExternalIds ExternalToInternal', async () => {
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');

                await handler.handle(
                    buildEvent(DiscrepancyEntityType.User, {
                        mismatchedIds: [],
                        onlyInExternalIds: [10, 20],
                        onlyInInternalIds: [],
                    }),
                );

                expect(commandBusExecuteMethod).toHaveBeenCalledTimes(2);
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    expect.objectContaining<Partial<SyncDiscrepancyByEntityIdCommand>>({
                        entityId: 10,
                        syncType: DiscrepancySyncType.ExternalToInternal,
                    }),
                );
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    expect.objectContaining<Partial<SyncDiscrepancyByEntityIdCommand>>({
                        entityId: 20,
                        syncType: DiscrepancySyncType.ExternalToInternal,
                    }),
                );
            });

            it.skip('should sync onlyInInternalIds InternalToExternal', async () => {
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');

                await handler.handle(
                    buildEvent(DiscrepancyEntityType.User, {
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
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    expect.objectContaining<Partial<SyncDiscrepancyByEntityIdCommand>>({
                        entityId: 40,
                        syncType: DiscrepancySyncType.InternalToExternal,
                    }),
                );
            });

            it('should not execute any command for mismatchedIds', async () => {
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');

                await handler.handle(
                    buildEvent(DiscrepancyEntityType.User, {
                        mismatchedIds: [1, 2, 3],
                        onlyInExternalIds: [],
                        onlyInInternalIds: [],
                    }),
                );

                expect(commandBusExecuteMethod).not.toHaveBeenCalled();
            });

            it.skip('should handle both onlyInExternalIds and onlyInInternalIds in one event', async () => {
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');

                await handler.handle(
                    buildEvent(DiscrepancyEntityType.GroupPolicy, {
                        mismatchedIds: [99],
                        onlyInExternalIds: [10],
                        onlyInInternalIds: [20],
                    }),
                );

                expect(commandBusExecuteMethod).toHaveBeenCalledTimes(2);
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    expect.objectContaining<Partial<SyncDiscrepancyByEntityIdCommand>>({
                        entityId: 10,
                        syncType: DiscrepancySyncType.ExternalToInternal,
                    }),
                );
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    expect.objectContaining<Partial<SyncDiscrepancyByEntityIdCommand>>({
                        entityId: 20,
                        syncType: DiscrepancySyncType.InternalToExternal,
                    }),
                );
            });

            it('should not execute any command when all lists are empty', async () => {
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');

                await handler.handle(
                    buildEvent(DiscrepancyEntityType.Team, {
                        mismatchedIds: [],
                        onlyInExternalIds: [],
                        onlyInInternalIds: [],
                    }),
                );

                expect(commandBusExecuteMethod).not.toHaveBeenCalled();
            });

            it.skip('should pass transactionId and tenantId to the command', async () => {
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');

                await handler.handle(
                    buildEvent(
                        DiscrepancyEntityType.User,
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
