import { DiscrepancyEntityType } from '../../enums';
import { Discrepancy } from '../../models';

export class DiscrepancyEntity implements Discrepancy {
    public id!: number;
    public entityType!: DiscrepancyEntityType;
    public entityId!: number;
    public internalData?: Record<string, unknown>;
    public externalData?: Record<string, unknown>;
    public creationDate!: Date;
    public lastModificationDate?: Date;

    public static create(
        id: number,
        entityType: DiscrepancyEntityType,
        entityId: number,
        internalData: Record<string, unknown> | undefined,
        externalData: Record<string, unknown> | undefined,
    ): DiscrepancyEntity {
        const entity = new DiscrepancyEntity();
        entity.id = id;
        entity.entityType = entityType;
        entity.entityId = entityId;
        entity.internalData = internalData;
        entity.externalData = externalData;

        return entity;
    }

    public static createWithoutId(
        entityType: DiscrepancyEntityType,
        entityId: number,
        internalData: Record<string, unknown> | undefined,
        externalData: Record<string, unknown> | undefined,
    ): DiscrepancyEntity {
        const entity = new DiscrepancyEntity();
        entity.entityType = entityType;
        entity.entityId = entityId;
        entity.internalData = internalData;
        entity.externalData = externalData;

        return entity;
    }
}
