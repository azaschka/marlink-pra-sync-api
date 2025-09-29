import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { TeamEntity } from '../../../team/repositories/entities';
import { GroupPolicyTeamRoleType } from '../../enums';
import { GroupPolicyTeam } from '../../models';

export class GroupPolicyTeamEntity implements GroupPolicyTeam {
    public groupPolicyId!: number;
    public teamId!: number;
    public roleType?: GroupPolicyTeamRoleType;
    public groupPolicy?: GroupPolicyEntity;
    public team?: TeamEntity;
    public lastSyncDate!: Date;

    public static create(
        groupPolicyId: number,
        teamId: number,
        roleType?: GroupPolicyTeamRoleType,
    ): GroupPolicyTeamEntity {
        const entity = new GroupPolicyTeamEntity();
        entity.groupPolicyId = groupPolicyId;
        entity.teamId = teamId;
        entity.roleType = roleType;
        entity.groupPolicy = { id: groupPolicyId } as GroupPolicyEntity; // Stub GroupPolicyEntity with only the id
        entity.team = { id: teamId } as TeamEntity; // Stub TeamEntity with only the id
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
