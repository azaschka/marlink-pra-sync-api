import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import { DiscrepancyEntityType } from '../../enums';
import { Discrepancy } from '../../models';

export class DiscrepancySchemaFactory implements BaseTenantEntitySchemaFactory<Discrepancy> {
    public static readonly TABLE_NAME = 'discrepancies';

    public create(tenantId: number): EntitySchema<Discrepancy> {
        return new EntitySchema<Discrepancy>({
            name: `${DiscrepancySchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${DiscrepancySchemaFactory.TABLE_NAME}_${tenantId}`,
            columns: {
                id: {
                    name: 'id',
                    type: 'int',
                    primary: true,
                    generated: true,
                },
                entityType: {
                    name: 'entity_type',
                    type: 'enum',
                    enum: DiscrepancyEntityType,
                    nullable: false,
                },
                entityId: {
                    name: 'entity_id',
                    type: 'int',
                    nullable: false,
                },
                internalData: {
                    name: 'internal_data',
                    type: 'json',
                    nullable: true,
                },
                externalData: {
                    name: 'external_data',
                    type: 'json',
                    nullable: true,
                },
                creationDate: {
                    name: 'creation_date',
                    type: 'timestamp',
                    createDate: true,
                },
                lastModificationDate: {
                    name: 'last_modification_date',
                    type: 'timestamp',
                    updateDate: true,
                    nullable: true,
                },
            },
        });
    }
}
