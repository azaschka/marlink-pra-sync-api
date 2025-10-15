import { SyncEntityType } from '../enums';

export interface SyncDiscrepancy {
    id: number;
    beyondtrustInstanceId: number;
    entityType: SyncEntityType;
    entityId: number;
    internalData?: Record<string, unknown>;
    externalData?: Record<string, unknown>;
    creationDate: Date;
    lastModificationDate?: Date;
}
