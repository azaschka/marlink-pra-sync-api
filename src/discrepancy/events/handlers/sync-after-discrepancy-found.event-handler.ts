import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SyncDiscrepancyByEntityIdCommand } from '../../commands';
import { DiscrepancyEntityType, DiscrepancySyncType } from '../../enums';
import { DiscrepancyScannedEvent } from '../discrepancy-scanned.event';

// Note: Not saga because we want to limit concurrency of db operations.
@EventsHandler(DiscrepancyScannedEvent)
export class SyncAfterDiscrepancyFoundEventHandler implements IEventHandler<DiscrepancyScannedEvent> {
    // Note: Might move to env config in the future
    private static readonly AUTO_SYNC_ENTITY_TYPES = [
        DiscrepancyEntityType.JumpClient,
        DiscrepancyEntityType.JumpClientInstaller,
        DiscrepancyEntityType.SessionPolicy,
    ];

    constructor(private readonly commandBus: CommandBus) {}

    public async handle(event: DiscrepancyScannedEvent) {
        if (
            !SyncAfterDiscrepancyFoundEventHandler.AUTO_SYNC_ENTITY_TYPES.includes(
                event.payload.discrepancyOverview.entityType,
            )
        ) {
            return;
        }

        const allDiscrepancyEntityIds = new Set([
            ...event.payload.discrepancyOverview.mismatchedIds,
            ...event.payload.discrepancyOverview.onlyInExternalIds,
            ...event.payload.discrepancyOverview.onlyInInternalIds,
        ]);

        for (const entityId of allDiscrepancyEntityIds) {
            await this.commandBus.execute(
                new SyncDiscrepancyByEntityIdCommand(
                    event.transactionId,
                    event.payload.tenantId,
                    entityId,
                    event.payload.discrepancyOverview.entityType,
                    DiscrepancySyncType.ExternalToInternal,
                ),
            );
        }
    }
}
