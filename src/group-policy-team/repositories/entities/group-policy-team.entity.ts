import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { TeamEntity } from '../../../team/repositories/entities';
import { GroupPolicyTeamRoleType } from '../../enums';
import { GroupPolicyTeam } from '../../models';

@Entity({ name: 'group_policy_teams' })
export class GroupPolicyTeamEntity implements GroupPolicyTeam {
    @PrimaryColumn({ name: 'group_policy_id', type: 'int' })
    public groupPolicyId!: number;

    @PrimaryColumn({ name: 'team_id', type: 'int' })
    public teamId!: number;

    @Column({ name: 'role_type', type: 'enum', enum: GroupPolicyTeamRoleType, nullable: true })
    public roleType?: GroupPolicyTeamRoleType;

    @ManyToOne(() => GroupPolicyEntity, (groupPolicy) => groupPolicy.groupPolicyTeams)
    @JoinColumn({ name: 'group_policy_id' })
    public groupPolicy!: GroupPolicyEntity;

    @ManyToOne(() => TeamEntity, (team) => team.groupPolicyTeams, { eager: true })
    @JoinColumn({ name: 'team_id' })
    public team!: TeamEntity;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
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
