import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import { GroupPolicyMember } from '../../models';

export class GroupPolicyMemberSchemaFactory implements BaseTenantEntitySchemaFactory<GroupPolicyMember> {
    public static readonly TABLE_NAME = 'group_policy_members';

    public create(tenantId: number): EntitySchema<GroupPolicyMember> {
        return new EntitySchema<GroupPolicyMember>({
            name: `${GroupPolicyMemberSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${GroupPolicyMemberSchemaFactory.TABLE_NAME}_${tenantId}`,
            columns: {
                groupPolicyId: {
                    name: 'group_policy_id',
                    type: 'int',
                    primary: true,
                },
                memberId: {
                    name: 'member_id',
                    type: 'int',
                    primary: true,
                },
                userId: {
                    name: 'user_id',
                    type: 'int',
                    nullable: false,
                },
                securityProviderId: {
                    name: 'security_provider_id',
                    type: 'int',
                    nullable: false,
                },
                distinguishedName: {
                    name: 'distinguished_name',
                    type: 'text',
                    nullable: true,
                },
                groupName: {
                    name: 'group_name',
                    type: 'varchar',
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
                    inverseSide: 'groupPolicyMembers',
                    onDelete: 'CASCADE',
                },
                user: {
                    type: 'many-to-one',
                    target: `users_${tenantId}`,
                    joinColumn: {
                        name: 'user_id',
                    },
                    inverseSide: 'groupPolicyMembers',
                    onDelete: 'CASCADE',
                    eager: true,
                },
            },
        });
    }
}
