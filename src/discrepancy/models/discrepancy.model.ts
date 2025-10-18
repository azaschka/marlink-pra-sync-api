import { DiscrepancyEntityType } from '../enums';

export interface Discrepancy {
    id: number;
    entityType: DiscrepancyEntityType;
    entityId: number;
    internalData?: Record<string, unknown>;
    externalData?: Record<string, unknown>;
    creationDate: Date;
    lastModificationDate?: Date;
}
