import { SyncEntityType } from '../enums';

export interface SyncComparisonOverview {
    tenantId: number;
    syncEntityType: SyncEntityType;
    totalBtData: number;
    totalDbData: number;
    identicalDataIds: number[];
    onlyInBtIds: number[];
    onlyInDbIds: number[];
    differentDataIds: number[];
}
