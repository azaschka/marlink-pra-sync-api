import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, CommandHandler, CqrsModule, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { SyncDiscrepancyByEntityIdCommand } from '../../commands';
import { DiscrepancyEntityType, DiscrepancySyncType } from '../../enums';
import { DiscrepancyScannedEvent } from '../discrepancy-scanned.event';
import { SyncAfterDiscrepancyFoundEventHandler } from './sync-after-discrepancy-found.event-handler';

@Injectable()
class SyncCommandExecutionProbe {
    public calls: SyncDiscrepancyByEntityIdCommand[] = [];
    public failOnEntityIds = new Set<number>();

    public reset(): void {
        this.calls = [];
        this.failOnEntityIds.clear();
    }
}

@CommandHandler(SyncDiscrepancyByEntityIdCommand)
class SyncDiscrepancyByEntityIdCommandProbeHandler implements ICommandHandler<SyncDiscrepancyByEntityIdCommand> {
    constructor(private readonly probe: SyncCommandExecutionProbe) {}

    public async execute(command: SyncDiscrepancyByEntityIdCommand): Promise<void> {
        this.probe.calls.push(command);

        if (this.probe.failOnEntityIds.has(command.entityId)) {
            throw new Error(`Forced sync failure for entity ${command.entityId}`);
        }
    }
}

describe('SyncAfterDiscrepancyFoundEventHandler (integration)', () => {
    let testingModule: TestingModule;
    let eventBus: EventBus;
    let commandBus: CommandBus;
    let probe: SyncCommandExecutionProbe;

    beforeEach(async () => {
        jest.spyOn(console, 'warn').mockImplementation();

        testingModule = await Test.createTestingModule({
            imports: [CqrsModule],
            providers: [
                SyncAfterDiscrepancyFoundEventHandler,
                SyncDiscrepancyByEntityIdCommandProbeHandler,
                SyncCommandExecutionProbe,
            ],
        }).compile();

        await testingModule.init();

        eventBus = testingModule.get(EventBus);
        commandBus = testingModule.get(CommandBus);
        probe = testingModule.get(SyncCommandExecutionProbe);

        jest.spyOn(commandBus, 'execute');
    });

    afterEach(async () => {
        probe.reset();
        jest.clearAllMocks();
        await testingModule.close();
    });

    it('should auto-sync all onlyInExternalIds for non-auto entity types via CQRS pipeline', async () => {
        await eventBus.publish(
            buildEvent(DiscrepancyEntityType.User, {
                mismatchedIds: [999],
                onlyInExternalIds: [10, 20],
                onlyInInternalIds: [30],
            }),
        );

        const syncedEntityIds = probe.calls.map((call) => call.entityId).sort((a, b) => a - b);
        expect(syncedEntityIds).toEqual([10, 20]);
        expect(probe.calls.every((call) => call.syncType === DiscrepancySyncType.ExternalToInternal)).toBe(true);
        expect(probe.calls.every((call) => call.entityType === DiscrepancyEntityType.User)).toBe(true);
        expect(probe.calls.every((call) => call.transactionId === 'tx-integration-1')).toBe(true);
        expect(probe.calls.every((call) => call.tenantId === 77)).toBe(true);
    });

    it('should keep syncing remaining onlyInExternalIds when one sync command fails', async () => {
        probe.failOnEntityIds.add(20);

        await eventBus.publish(
            buildEvent(DiscrepancyEntityType.Team, {
                mismatchedIds: [],
                onlyInExternalIds: [10, 20, 30],
                onlyInInternalIds: [],
            }),
        );

        const attemptedEntityIds = probe.calls.map((call) => call.entityId).sort((a, b) => a - b);
        expect(attemptedEntityIds).toEqual([10, 20, 30]);
    });

    it('should not dispatch sync commands when only mismatchedIds exist for non-auto entity types', async () => {
        await eventBus.publish(
            buildEvent(DiscrepancyEntityType.GroupPolicy, {
                mismatchedIds: [1, 2],
                onlyInExternalIds: [],
                onlyInInternalIds: [],
            }),
        );

        expect(probe.calls).toHaveLength(0);
        expect(commandBus.execute).not.toHaveBeenCalled();
    });

    it('should deduplicate onlyInExternalIds before dispatching sync commands', async () => {
        await eventBus.publish(
            buildEvent(DiscrepancyEntityType.User, {
                mismatchedIds: [],
                onlyInExternalIds: [10, 10, 20],
                onlyInInternalIds: [],
            }),
        );

        const syncedEntityIds = probe.calls.map((call) => call.entityId).sort((a, b) => a - b);
        expect(syncedEntityIds).toEqual([10, 20]);
    });
});

function buildEvent(
    entityType: DiscrepancyEntityType,
    ids: { mismatchedIds: number[]; onlyInExternalIds: number[]; onlyInInternalIds: number[] },
): DiscrepancyScannedEvent {
    return new DiscrepancyScannedEvent('tx-integration-1', {
        tenantId: 77,
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
