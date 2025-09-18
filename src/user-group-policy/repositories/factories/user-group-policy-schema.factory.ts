import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import { UserGroupPolicy } from '../../models';

export class UserGroupPolicySchemaFactory implements BaseTenantEntitySchemaFactory<UserGroupPolicy> {
    public static readonly TABLE_NAME = 'user_group_policies';

    public create(tenantId: number): EntitySchema<UserGroupPolicy> {
        return new EntitySchema<UserGroupPolicy>({
            name: `${UserGroupPolicySchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${UserGroupPolicySchemaFactory.TABLE_NAME}_${tenantId}`,
            columns: {
                userId: {
                    name: 'user_id',
                    type: 'int',
                    primary: true,
                },
                groupPolicyId: {
                    name: 'group_policy_id',
                    type: 'int',
                    primary: true,
                },
                lastSyncDate: {
                    name: 'last_sync_date',
                    type: 'timestamp',
                    precision: 3,
                    nullable: false,
                },
            },
            // relations: {
            //     user: {
            //         type: 'many-to-one',
            //         target: `users_${tenantId}`,
            //         joinColumn: {
            //             name: 'user_id',
            //             referencedColumnName: 'id',
            //         },
            //         onDelete: 'CASCADE',
            //     },
            //     groupPolicy: {
            //         type: 'many-to-one',
            //         target: `group_policies_${tenantId}`,
            //         joinColumn: {
            //             name: 'group_policy_id',
            //             referencedColumnName: 'id',
            //         },
            //         onDelete: 'CASCADE',
            //         eager: true,
            //     },
            // },
        });
    }
}
