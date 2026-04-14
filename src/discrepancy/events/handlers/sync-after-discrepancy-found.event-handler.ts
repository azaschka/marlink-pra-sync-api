import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SyncDiscrepancyByEntityIdCommand } from '../../commands';
import { DiscrepancyEntityType, DiscrepancySyncType } from '../../enums';
import { DiscrepancyScannedEvent } from '../discrepancy-scanned.event';

// Note: Not saga because we want to limit concurrency of db operations.
@EventsHandler(DiscrepancyScannedEvent)
export class SyncAfterDiscrepancyFoundEventHandler implements IEventHandler<DiscrepancyScannedEvent> {
    // Note: Might move to env config in the future
    // Checked first to guarantee ExternalToInternal always wins for all discrepancy types on these entities.
    private static readonly AUTO_SYNC_ENTITY_TYPES = [
        DiscrepancyEntityType.JumpClient,
        DiscrepancyEntityType.JumpClientInstaller,
        DiscrepancyEntityType.Jumpoint,
        DiscrepancyEntityType.GroupPolicyJumpoint,
        DiscrepancyEntityType.SessionPolicy,
    ];

    constructor(private readonly commandBus: CommandBus) {}

    public async handle(event: DiscrepancyScannedEvent) {
        const { entityType, mismatchedIds, onlyInExternalIds, onlyInInternalIds } = event.payload.discrepancyOverview;

        if (SyncAfterDiscrepancyFoundEventHandler.AUTO_SYNC_ENTITY_TYPES.includes(entityType)) {
            const allDiscrepancyEntityIds = new Set([...mismatchedIds, ...onlyInExternalIds, ...onlyInInternalIds]);

            for (const entityId of allDiscrepancyEntityIds) {
                await this.commandBus.execute(
                    new SyncDiscrepancyByEntityIdCommand(
                        event.transactionId,
                        event.payload.tenantId,
                        entityId,
                        entityType,
                        DiscrepancySyncType.ExternalToInternal,
                    ),
                );
            }

            return;
        }

        // For all other entity types: sync onlyInExternalIds ExternalToInternal (create missing records in DB)
        for (const entityId of onlyInExternalIds) {
            await this.commandBus.execute(
                new SyncDiscrepancyByEntityIdCommand(
                    event.transactionId,
                    event.payload.tenantId,
                    entityId,
                    entityType,
                    DiscrepancySyncType.ExternalToInternal,
                ),
            );
        }

        // For all other entity types: sync onlyInInternalIds InternalToExternal (push missing records to BT)
        for (const entityId of onlyInInternalIds) {
            await this.commandBus.execute(
                new SyncDiscrepancyByEntityIdCommand(
                    event.transactionId,
                    event.payload.tenantId,
                    entityId,
                    entityType,
                    DiscrepancySyncType.InternalToExternal,
                ),
            );
        }
    }
}
