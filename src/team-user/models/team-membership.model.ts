import { UserTeamRoleType } from '../enums';

export interface TeamMembership {
    userId: number;
    roleType: UserTeamRoleType;
}
