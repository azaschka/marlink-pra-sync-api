import { DiscrepancyEntityType, DiscrepancySyncType } from '../enums';

/**
 * Syncs the discrepancy of one entity. For a relation type (`RELATION_DISCREPANCY_ENTITY_TYPES`) `entityId` is the
 * parent id and `foreignEntityId` the child id; both are required to find the record.
 */
export class SyncDiscrepancyByEntityIdCommand {
    public readonly commandType = 'sync-discrepancy-by-entity-id';

    constructor(
        public readonly transactionId: string,
        public readonly tenantId: number,
        public readonly entityId: number,
        public readonly entityType: DiscrepancyEntityType,
        public readonly syncType: DiscrepancySyncType,
        public readonly foreignEntityId?: number,
    ) {}
}

/** Outcome of one auto-sync; failures are reported, not thrown, so callers can count them. */
export interface SyncDiscrepancyByEntityIdResult {
    readonly synced: boolean;
    readonly failureKind?: string;
}
