import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import { UserTeamRoleType } from '../../enums';
import { TeamUser } from '../../models';

export class TeamUserSchemaFactory implements BaseTenantEntitySchemaFactory<TeamUser> {
    public static readonly TABLE_NAME = 'team_users';

    public create(tenantId: number): EntitySchema<TeamUser> {
        return new EntitySchema<TeamUser>({
            name: `${TeamUserSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${TeamUserSchemaFactory.TABLE_NAME}_${tenantId}`,
            columns: {
                teamId: {
                    name: 'team_id',
                    type: 'int',
                    primary: true,
                },
                userId: {
                    name: 'user_id',
                    type: 'int',
                    primary: true,
                },
                roleType: {
                    name: 'role_type',
                    type: 'enum',
                    enum: UserTeamRoleType,
                    nullable: false,
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
                team: {
                    type: 'many-to-one',
                    target: `teams_${tenantId}`,
                    joinColumn: {
                        name: 'team_id',
                    },
                    inverseSide: 'teamUsers',
                    onDelete: 'CASCADE',
                },
                user: {
                    type: 'many-to-one',
                    target: `users_${tenantId}`,
                    joinColumn: {
                        name: 'user_id',
                    },
                    inverseSide: 'teamUsers',
                    onDelete: 'CASCADE',
                    eager: true,
                },
            },
        });
    }
}
