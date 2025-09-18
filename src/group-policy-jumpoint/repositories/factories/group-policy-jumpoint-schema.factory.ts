import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import { GroupPolicyJumpoint } from '../../models';

export class GroupPolicyJumpointSchemaFactory implements BaseTenantEntitySchemaFactory<GroupPolicyJumpoint> {
    public static readonly TABLE_NAME = 'group_policy_jumpoints';

    public create(tenantId: number): EntitySchema<GroupPolicyJumpoint> {
        return new EntitySchema<GroupPolicyJumpoint>({
            name: `${GroupPolicyJumpointSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${GroupPolicyJumpointSchemaFactory.TABLE_NAME}_${tenantId}`,
            columns: {
                groupPolicyId: {
                    name: 'group_policy_id',
                    type: 'int',
                    primary: true,
                },
                jumpointId: {
                    name: 'jumpoint_id',
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
            //     groupPolicy: {
            //         type: 'many-to-one',
            //         target: `group_policies_${tenantId}`,
            //         joinColumn: {
            //             name: 'group_policy_id',
            //             referencedColumnName: 'id',
            //         },
            //         onDelete: 'CASCADE',
            //     },
            //     jumpoint: {
            //         type: 'many-to-one',
            //         target: `jumpoints_${tenantId}`,
            //         joinColumn: {
            //             name: 'jumpoint_id',
            //             referencedColumnName: 'id',
            //         },
            //         eager: true,
            //         onDelete: 'CASCADE',
            //     },
            // },
        });
    }
}
