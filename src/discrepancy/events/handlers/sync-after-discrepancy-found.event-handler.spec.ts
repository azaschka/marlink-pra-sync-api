import { CommandBus } from '@nestjs/cqrs';
import { SyncDiscrepancyByEntityIdCommand } from '../../commands';
import { DiscrepancyEntityType, DiscrepancySyncType } from '../../enums';
import { DiscrepancyScannedEvent } from '../discrepancy-scanned.event';
import { SyncAfterDiscrepancyFoundEventHandler } from './sync-after-discrepancy-found.event-handler';

describe('SyncAfterDiscrepancyFoundEventHandler', () => {
    let handler: SyncAfterDiscrepancyFoundEventHandler;
    let commandBus: CommandBus;

    beforeEach(() => {
        commandBus = mockCommandBus();
        handler = new SyncAfterDiscrepancyFoundEventHandler(commandBus);
    });

    describe('handle', () => {
        describe('AUTO_SYNC_ENTITY_TYPES (full sync, ExternalToInternal)', () => {
            it.each([
                DiscrepancyEntityType.JumpClient,
                DiscrepancyEntityType.JumpClientInstaller,
                DiscrepancyEntityType.Jumpoint,
                DiscrepancyEntityType.JumpointNode,
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
                DiscrepancyEntityType.JumpointNode,
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
        });

        describe('all other entity types', () => {
            it('should sync onlyInExternalIds ExternalToInternal', async () => {
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

            it('should sync onlyInInternalIds InternalToExternal', async () => {
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
                await handler.handle(
                    buildEvent(DiscrepancyEntityType.User, {
                        mismatchedIds: [1, 2, 3],
                        onlyInExternalIds: [],
                        onlyInInternalIds: [],
                    }),
                );

                expect(commandBus.execute).not.toHaveBeenCalled();
            });

            it('should handle both onlyInExternalIds and onlyInInternalIds in one event', async () => {
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
                await handler.handle(
                    buildEvent(DiscrepancyEntityType.Team, {
                        mismatchedIds: [],
                        onlyInExternalIds: [],
                        onlyInInternalIds: [],
                    }),
                );

                expect(commandBus.execute).not.toHaveBeenCalled();
            });

            it('should pass transactionId and tenantId to the command', async () => {
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
