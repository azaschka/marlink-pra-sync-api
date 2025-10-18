import { DiscrepancyEntityType } from '../enums';

export interface DiscrepancyOverview {
    entityType: DiscrepancyEntityType;
    totalBtData: number;
    totalDbData: number;
    identicalDataIds: number[];
    onlyInBtIds: number[];
    onlyInDbIds: number[];
    differentDataIds: number[];
}
