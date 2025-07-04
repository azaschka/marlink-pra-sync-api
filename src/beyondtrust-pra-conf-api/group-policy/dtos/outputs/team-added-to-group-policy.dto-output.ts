import { Expose } from 'class-transformer';
import { GroupPolicyTeamRoleType } from '../../enums';

export class TeamAddedToGroupPolicyDtoOutput {
    @Expose({ name: 'team_id' })
    public teamId!: number;

    @Expose({ name: 'role' })
    public role?: GroupPolicyTeamRoleType;
}
