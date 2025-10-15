import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SyncEntityType } from '../../enums';
import { SyncDiscrepancy } from '../../models';

@Entity({ name: 'sync_discrepancies' })
export class SyncDiscrepancyEntity implements SyncDiscrepancy {
    @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
    public id!: number;

    @Column({ name: 'beyondtrust_instance_id', type: 'int' })
    public beyondtrustInstanceId!: number;

    @Column({ name: 'entity_type', type: 'enum', enum: SyncEntityType })
    public entityType!: SyncEntityType;

    @Column({ name: 'entity_id', type: 'int' })
    public entityId!: number;

    @Column({ name: 'internal_data', type: 'json', nullable: true })
    public internalData?: Record<string, unknown>;

    @Column({ name: 'external_data', type: 'json', nullable: true })
    public externalData?: Record<string, unknown>;

    @CreateDateColumn({ name: 'creation_date', type: 'timestamp' })
    public creationDate!: Date;

    @UpdateDateColumn({ name: 'last_modification_date', type: 'timestamp', nullable: true })
    public lastModificationDate?: Date;

    public static create(
        id: number,
        beyondtrustInstanceId: number,
        entityType: SyncEntityType,
        entityId: number,
        internalData: Record<string, unknown> | undefined,
        externalData: Record<string, unknown> | undefined,
    ): SyncDiscrepancyEntity {
        const entity = new SyncDiscrepancyEntity();
        entity.id = id;
        entity.beyondtrustInstanceId = beyondtrustInstanceId;
        entity.entityType = entityType;
        entity.entityId = entityId;
        entity.internalData = internalData;
        entity.externalData = externalData;

        return entity;
    }

    public static createWithoutId(
        beyondtrustInstanceId: number,
        entityType: SyncEntityType,
        entityId: number,
        internalData: Record<string, unknown> | undefined,
        externalData: Record<string, unknown> | undefined,
    ): SyncDiscrepancyEntity {
        const entity = new SyncDiscrepancyEntity();
        entity.beyondtrustInstanceId = beyondtrustInstanceId;
        entity.entityType = entityType;
        entity.entityId = entityId;
        entity.internalData = internalData;
        entity.externalData = externalData;

        return entity;
    }
}
