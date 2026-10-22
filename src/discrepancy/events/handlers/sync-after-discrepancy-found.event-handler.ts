import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ScanContext } from '../../../shared/context/scan-context';
import { SyncDiscrepancyByEntityIdCommand, SyncDiscrepancyByEntityIdResult } from '../../commands';
import {
    DiscrepancyEntityType,
    DiscrepancyScanState,
    DiscrepancySyncType,
    isRelationDiscrepancyEntityType,
} from '../../enums';
import { TASK_DROPPED } from '../../services/bounded-task-limiter';
import { DiscrepancyScanOutcome } from '../../services/discrepancy-scan-outcome';
import { ScanCoordinatorService } from '../../services/scan-coordinator.service';
import { DiscrepancyScannedEvent } from '../discrepancy-scanned.event';

/** Identifies one discrepancy record: the entity id, or for a relation type the parent and child id. */
interface AutoSyncTarget {
    readonly entityId: number;
    readonly foreignEntityId?: number;
}

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

    // Concurrency is limited globally (all tenants and events) by ScanCoordinatorService. Failures are
    // tolerated — next 30-min scan retries.
    constructor(
        private readonly commandBus: CommandBus,
        private readonly scanCoordinatorService: ScanCoordinatorService,
    ) {}

    public async handle(event: DiscrepancyScannedEvent) {
        const { entityType, mismatchedIds, onlyInExternalIds, onlyInInternalIds, state } =
            event.payload.discrepancyOverview;

        // Only complete scans may drive auto-sync; empty ID lists of a failed scan mean "unknown".
        if (state !== undefined && state !== DiscrepancyScanState.Succeeded) {
            return;
        }

        if (SyncAfterDiscrepancyFoundEventHandler.AUTO_SYNC_ENTITY_TYPES.includes(entityType)) {
            await this.syncExternalToInternal(
                event,
                this.toTargets(event, [...new Set([...mismatchedIds, ...onlyInExternalIds, ...onlyInInternalIds])]),
            );

            return;
        }

        // For all other entity types: sync onlyInExternalIds ExternalToInternal (create missing records in DB).
        // Use the same fault-tolerant pattern so one failed entity does not block remaining BT-only records.
        await this.syncExternalToInternal(event, this.toTargets(event, [...new Set(onlyInExternalIds)]));

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

    /**
     * The ids of a main overview are entity ids. The ids of a relation overview are child ids of `parentId`, and
     * the record is found only by parent and child (MARLINKPRA-80). A relation overview without a parent id is not
     * synced: the record cannot be identified, and a lookup by child id alone would hit unrelated records.
     */
    private toTargets(event: DiscrepancyScannedEvent, ids: number[]): AutoSyncTarget[] {
        const { entityType, parentId } = event.payload.discrepancyOverview;

        if (!isRelationDiscrepancyEntityType(entityType)) {
            return ids.map((entityId) => ({ entityId }));
        }

        if (ids.length === 0) {
            return [];
        }

        if (parentId === undefined || parentId === null) {
            console.warn(
                `⚠️ ${DiscrepancyScanOutcome.logPrefix(event.payload.tenantId)} auto-sync ${entityType}: ${ids.length} not synced, the overview has no parent id`,
            );

            return [];
        }

        return ids.map((childId) => ({ entityId: parentId, foreignEntityId: childId }));
    }

    /**
     * Syncs the entities with bounded concurrency and logs one summary line per event. Auto-sync triggered by a
     * scan belongs to that scan: once its budget expired, queued syncs are skipped (they are redone after the
     * next complete scan).
     */
    private async syncExternalToInternal(event: DiscrepancyScannedEvent, targets: AutoSyncTarget[]): Promise<void> {
        if (targets.length === 0) {
            return;
        }

        const { entityType } = event.payload.discrepancyOverview;
        const results = await Promise.allSettled(
            targets.map(({ entityId, foreignEntityId }) =>
                this.scanCoordinatorService.runAutoSync(
                    async (): Promise<SyncDiscrepancyByEntityIdResult | 'skipped'> => {
                        if (ScanContext.isAborted()) {
                            return 'skipped';
                        }

                        return this.commandBus.execute<
                            SyncDiscrepancyByEntityIdCommand,
                            SyncDiscrepancyByEntityIdResult
                        >(
                            new SyncDiscrepancyByEntityIdCommand(
                                event.transactionId,
                                event.payload.tenantId,
                                entityId,
                                entityType,
                                DiscrepancySyncType.ExternalToInternal,
                                foreignEntityId,
                            ),
                        );
                    },
                    (result) => result !== 'skipped' && result?.synced === false,
                ),
            ),
        );

        let synced = 0;
        let skipped = 0;
        const failureKinds = new Map<string, number>();

        const recordFailure = (kind: string) => failureKinds.set(kind, (failureKinds.get(kind) ?? 0) + 1);

        for (const result of results) {
            if (result.status === 'rejected') {
                recordFailure(DiscrepancyScanOutcome.failureKindOf(result.reason));
            } else if (result.value === TASK_DROPPED) {
                recordFailure('QueueFull');
            } else if (result.value === 'skipped') {
                skipped++;
            } else if (result.value?.synced ?? true) {
                synced++;
            } else {
                recordFailure(result.value.failureKind ?? DiscrepancyScanOutcome.INTERNAL);
            }
        }

        const failed = targets.length - synced - skipped;
        const kinds = [...failureKinds.entries()].map(([kind, n]) => `${kind} x${n}`).join(', ');
        const line = `${DiscrepancyScanOutcome.logPrefix(event.payload.tenantId)} auto-sync ${entityType}: ${synced} synced, ${failed} failed${
            kinds ? ` (${kinds})` : ''
        }, ${skipped} skipped${skipped > 0 ? ' (budget expired)' : ''}`;

        if (failed > 0 || skipped > 0) {
            console.warn(`⚠️ ${line}. Will retry on next scan.`);
        } else {
            console.log(`🔁 ${line}`);
        }
    }
}
