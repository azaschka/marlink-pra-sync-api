import { Expose } from 'class-transformer';
import { UserTeamRoleType } from '../../enums';

export class UserAddedToTeamDtoOutput {
    @Expose({ name: 'user_id' })
    public userId!: number;

    public role!: UserTeamRoleType;
}
