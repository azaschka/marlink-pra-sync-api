import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import pLimit from 'p-limit';
import { SyncDiscrepancyByEntityIdCommand } from '../../commands';
import { DiscrepancyEntityType, DiscrepancySyncType } from '../../enums';
import { DiscrepancyScannedEvent } from '../discrepancy-scanned.event';

// Note: Not saga because we want to limit concurrency of db operations.
@EventsHandler(DiscrepancyScannedEvent)
export class SyncAfterDiscrepancyFoundEventHandler implements IEventHandler<DiscrepancyScannedEvent> {
    // Note: Might move to env config in the future
    // Checked first to guarantee ExternalToInternal always wins for all discrepancy types on these entities.
    // Temporarily set to ALL entity types: Marlink is not yet reviewing/approving discrepancies on their side,
    // so we auto-sync everything (BT always wins) until a long-term review workflow is in place.
    // Listed explicitly (instead of Object.values(DiscrepancyEntityType)) so individual types can be removed again.
    private static readonly AUTO_SYNC_ENTITY_TYPES = [
        DiscrepancyEntityType.GroupPolicy,
        DiscrepancyEntityType.GroupPolicyJumpGroup,
        DiscrepancyEntityType.GroupPolicyJumpoint,
        DiscrepancyEntityType.GroupPolicyMember,
        DiscrepancyEntityType.GroupPolicyTeam,
        DiscrepancyEntityType.JumpClient,
        DiscrepancyEntityType.JumpClientInstaller,
        DiscrepancyEntityType.JumpGroup,
        DiscrepancyEntityType.JumpItemProtocolTunnelJump,
        DiscrepancyEntityType.JumpItemRemoteRdp,
        DiscrepancyEntityType.JumpItemRemoteVnc,
        DiscrepancyEntityType.JumpItemShellJump,
        DiscrepancyEntityType.JumpItemWebJump,
        DiscrepancyEntityType.JumpPolicy,
        DiscrepancyEntityType.Jumpoint,
        DiscrepancyEntityType.JumpointNode,
        DiscrepancyEntityType.SessionPolicy,
        DiscrepancyEntityType.Team,
        DiscrepancyEntityType.TeamUser,
        DiscrepancyEntityType.User,
        DiscrepancyEntityType.UserGroupPolicy,
    ];

    // Limit concurrent BeyondTrust API sync calls to avoid overwhelming the external API
    // while keeping the frontend responsive. Failures are tolerated — next 30-min scan retries.
    private static readonly SYNC_CONCURRENCY_LIMIT = 3;

    constructor(private readonly commandBus: CommandBus) {}

    public async handle(event: DiscrepancyScannedEvent) {
        const { entityType, mismatchedIds, onlyInExternalIds, onlyInInternalIds } = event.payload.discrepancyOverview;

        if (SyncAfterDiscrepancyFoundEventHandler.AUTO_SYNC_ENTITY_TYPES.includes(entityType)) {
            const allDiscrepancyEntityIds = [
                ...new Set([...mismatchedIds, ...onlyInExternalIds, ...onlyInInternalIds]),
            ];

            if (allDiscrepancyEntityIds.length === 0) return;

            const limit = pLimit(SyncAfterDiscrepancyFoundEventHandler.SYNC_CONCURRENCY_LIMIT);

            const results = await Promise.allSettled(
                allDiscrepancyEntityIds.map((entityId) =>
                    limit(() =>
                        this.commandBus.execute(
                            new SyncDiscrepancyByEntityIdCommand(
                                event.transactionId,
                                event.payload.tenantId,
                                entityId,
                                entityType,
                                DiscrepancySyncType.ExternalToInternal,
                            ),
                        ),
                    ),
                ),
            );

            const failureCount = results.filter((r) => r.status === 'rejected').length;
            if (failureCount > 0) {
                console.warn(
                    `⚠️ [${event.transactionId}] ${failureCount}/${allDiscrepancyEntityIds.length} auto-sync operations failed for ${entityType}. Will retry on next scan.`,
                );
            }

            return;
        }

        // For all other entity types: sync onlyInExternalIds ExternalToInternal (create missing records in DB).
        // Use the same fault-tolerant pattern so one failed entity does not block remaining BT-only records.
        const onlyInExternalEntityIds = [...new Set(onlyInExternalIds)];
        if (onlyInExternalEntityIds.length > 0) {
            const limit = pLimit(SyncAfterDiscrepancyFoundEventHandler.SYNC_CONCURRENCY_LIMIT);

            const results = await Promise.allSettled(
                onlyInExternalEntityIds.map((entityId) =>
                    limit(() =>
                        this.commandBus.execute(
                            new SyncDiscrepancyByEntityIdCommand(
                                event.transactionId,
                                event.payload.tenantId,
                                entityId,
                                entityType,
                                DiscrepancySyncType.ExternalToInternal,
                            ),
                        ),
                    ),
                ),
            );

            const failureCount = results.filter((r) => r.status === 'rejected').length;
            if (failureCount > 0) {
                console.warn(
                    `⚠️ [${event.transactionId}] ${failureCount}/${onlyInExternalEntityIds.length} ExternalToInternal sync operations failed for ${entityType}. Will retry on next scan.`,
                );
            }
        }

        // For all other entity types: sync onlyInInternalIds InternalToExternal (push missing records to BT)
        // for (const entityId of onlyInInternalIds) {
        //     await this.commandBus.execute(
        //         new SyncDiscrepancyByEntityIdCommand(
        //             event.transactionId,
        //             event.payload.tenantId,
        //             entityId,
        //             entityType,
        //             DiscrepancySyncType.InternalToExternal,
        //         ),
        //     );
        // }
    }
}
