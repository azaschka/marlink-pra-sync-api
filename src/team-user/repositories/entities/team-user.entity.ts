import { DateUtility } from '../../../shared/utilities';
import { TeamEntity } from '../../../team/repositories/entities';
import { UserEntity } from '../../../user/repositories/entities';
import { UserTeamRoleType } from '../../enums';
import { TeamUser } from '../../models';

export class TeamUserEntity implements TeamUser {
    public teamId!: number;
    public userId!: number;
    public roleType!: UserTeamRoleType;
    public team?: TeamEntity;
    public user?: UserEntity;
    public lastSyncDate!: Date;

    public static create(teamId: number, userId: number, roleType: UserTeamRoleType): TeamUserEntity {
        const entity = new TeamUserEntity();
        entity.teamId = teamId;
        entity.userId = userId;
        entity.roleType = roleType;
        entity.team = { id: teamId } as TeamEntity; // Stub TeamEntity with only the id
        entity.user = { id: userId } as UserEntity; // Stub UserEntity with only the id
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
