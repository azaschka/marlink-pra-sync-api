import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import { Team } from '../../models';

export class TeamSchemaFactory implements BaseTenantEntitySchemaFactory<Team> {
    public static readonly TABLE_NAME = 'teams';

    public create(tenantId: number): EntitySchema<Team> {
        return new EntitySchema<Team>({
            name: `${TeamSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${TeamSchemaFactory.TABLE_NAME}_${tenantId}`,
            columns: {
                id: {
                    name: 'id',
                    type: 'int',
                    primary: true,
                    generated: undefined,
                    unique: true,
                },
                name: {
                    name: 'name',
                    type: 'varchar',
                    nullable: false,
                },
                codeName: {
                    name: 'code_name',
                    type: 'varchar',
                    nullable: true,
                },
                comments: {
                    name: 'comments',
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
            relations: {
                teamUsers: {
                    type: 'one-to-many',
                    target: `team_users_${tenantId}`,
                    inverseSide: 'team',
                },
                groupPolicyTeams: {
                    type: 'one-to-many',
                    target: `group_policy_teams_${tenantId}`,
                    inverseSide: 'team',
                },
            },
        });
    }
}
