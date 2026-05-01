import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import { SessionPolicy } from '../../models';

export class SessionPolicySchemaFactory implements BaseTenantEntitySchemaFactory<SessionPolicy> {
    public static readonly TABLE_NAME = 'session_policies';

    public create(tenantId: number): EntitySchema<SessionPolicy> {
        return new EntitySchema<SessionPolicy>({
            name: `${SessionPolicySchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${SessionPolicySchemaFactory.TABLE_NAME}_${tenantId}`,
            columns: {
                id: {
                    name: 'id',
                    type: 'int',
                    primary: true,
                    generated: undefined,
                    unique: true,
                },
                displayName: {
                    name: 'display_name',
                    type: 'varchar',
                    nullable: false,
                },
                codeName: {
                    name: 'code_name',
                    type: 'varchar',
                    nullable: false,
                },
                description: {
                    name: 'description',
                    type: 'text',
                    nullable: true,
                },
                lastSyncDate: {
                    name: 'last_sync_date',
                    type: 'timestamp',
                    precision: 3,
                    nullable: false,
                    updateDate: true,
                },
            },
        });
    }
}
