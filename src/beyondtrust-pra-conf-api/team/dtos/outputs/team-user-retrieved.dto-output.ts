import { Expose } from 'class-transformer';
import { UserTeamRoleType } from '../../enums';

export class TeamUserRetrievedDtoOutput {
    @Expose({ name: 'team_id' })
    public teamId!: number;

    @Expose({ name: 'user_id' })
    public userId!: number;

    public role!: UserTeamRoleType;
}
