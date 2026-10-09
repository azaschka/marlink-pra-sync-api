import { DiscrepancyEntityType, DiscrepancyScanState } from '../enums';

export interface DiscrepancyOverview {
    entityType: DiscrepancyEntityType;
    totalBtData: number;
    totalDbData: number;
    identicalIds: number[];
    onlyInExternalIds: number[];
    onlyInInternalIds: number[];
    mismatchedIds: number[];
    parentId?: number; // Only applicable for relational data. This id is the parent and all other ids are the children.
    /** Outcome of the scan. Optional for compatibility; absent in responses of older versions. */
    state?: DiscrepancyScanState;
    /** Why the scan failed or was skipped, e.g. a BeyondTrust error kind (UnexpectedResponse, NotFound). */
    failureKind?: string;
}
