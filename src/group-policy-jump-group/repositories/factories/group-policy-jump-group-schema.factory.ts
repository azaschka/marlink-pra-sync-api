import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import { GroupPolicyJumpGroup } from '../../models';

export class GroupPolicyJumpGroupSchemaFactory implements BaseTenantEntitySchemaFactory<GroupPolicyJumpGroup> {
    public static readonly TABLE_NAME = 'group_policy_jump_groups';

    public create(tenantId: number): EntitySchema<GroupPolicyJumpGroup> {
        return new EntitySchema<GroupPolicyJumpGroup>({
            name: `${GroupPolicyJumpGroupSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${GroupPolicyJumpGroupSchemaFactory.TABLE_NAME}_${tenantId}`,
            columns: {
                groupPolicyId: {
                    name: 'group_policy_id',
                    type: 'int',
                    primary: true,
                },
                jumpGroupId: {
                    name: 'jump_group_id',
                    type: 'int',
                    primary: true,
                },
                jumpItemRoleId: {
                    name: 'jump_item_role_id',
                    type: 'int',
                    nullable: true,
                },
                jumpPolicyId: {
                    name: 'jump_policy_id',
                    type: 'int',
                    nullable: true,
                },
                lastSyncDate: {
                    name: 'last_sync_date',
                    type: 'timestamp',
                    precision: 3,
                    nullable: false,
                },
            },
            relations: {
                groupPolicy: {
                    type: 'many-to-one',
                    target: `group_policies_${tenantId}`,
                    joinColumn: {
                        name: 'group_policy_id',
                    },
                    inverseSide: 'groupPolicyJumpGroups',
                    onDelete: 'CASCADE',
                },
                jumpGroup: {
                    type: 'many-to-one',
                    target: `jump_groups_${tenantId}`,
                    joinColumn: {
                        name: 'jump_group_id',
                    },
                    inverseSide: 'groupPolicyJumpGroups',
                    onDelete: 'CASCADE',
                    eager: true,
                },
            },
        });
    }
}
