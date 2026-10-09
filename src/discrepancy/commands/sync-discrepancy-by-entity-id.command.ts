import { DiscrepancyEntityType, DiscrepancySyncType } from '../enums';

export class SyncDiscrepancyByEntityIdCommand {
    public readonly commandType = 'sync-discrepancy-by-entity-id';

    constructor(
        public readonly transactionId: string,
        public readonly tenantId: number,
        public readonly entityId: number,
        public readonly entityType: DiscrepancyEntityType,
        public readonly syncType: DiscrepancySyncType,
    ) {}
}

/** Outcome of one auto-sync; failures are reported, not thrown, so callers can count them. */
export interface SyncDiscrepancyByEntityIdResult {
    readonly synced: boolean;
    readonly failureKind?: string;
}
