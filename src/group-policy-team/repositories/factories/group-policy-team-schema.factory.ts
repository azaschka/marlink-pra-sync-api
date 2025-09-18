import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import { GroupPolicyTeamRoleType } from '../../enums';
import { GroupPolicyTeam } from '../../models';

export class GroupPolicyTeamSchemaFactory implements BaseTenantEntitySchemaFactory<GroupPolicyTeam> {
    public static readonly TABLE_NAME = 'group_policy_teams';

    public create(tenantId: number): EntitySchema<GroupPolicyTeam> {
        return new EntitySchema<GroupPolicyTeam>({
            name: `${GroupPolicyTeamSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${GroupPolicyTeamSchemaFactory.TABLE_NAME}_${tenantId}`,
            columns: {
                groupPolicyId: {
                    name: 'group_policy_id',
                    type: 'int',
                    primary: true,
                },
                teamId: {
                    name: 'team_id',
                    type: 'int',
                    primary: true,
                },
                roleType: {
                    name: 'role_type',
                    type: 'enum',
                    enum: GroupPolicyTeamRoleType,
                    nullable: true,
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
            //     team: {
            //         type: 'many-to-one',
            //         target: `teams_${tenantId}`,
            //         joinColumn: {
            //             name: 'team_id',
            //             referencedColumnName: 'id',
            //         },
            //         eager: true,
            //         onDelete: 'CASCADE',
            //     },
            // },
        });
    }
}
