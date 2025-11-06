import { DiscrepancyEntityType } from '../../enums';
import { Discrepancy } from '../../models';

export class DiscrepancyEntity implements Discrepancy {
    public id!: number;
    public entityType!: DiscrepancyEntityType;
    public entityId!: number;
    public foreignEntityId?: number;
    public internalData?: Record<string, unknown>;
    public externalData?: Record<string, unknown>;
    public creationDate!: Date;
    public lastModificationDate?: Date;
}
