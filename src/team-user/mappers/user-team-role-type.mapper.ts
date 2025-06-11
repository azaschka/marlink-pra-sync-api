import { UserTeamRoleType as BTUserTeamRoleType } from '../../beyondtrust-pra-conf-api/team/enums';
import { UserTeamRoleType } from '../enums';

export function mapFromBTUserTeamRoleType(btUserTeamRoleType: BTUserTeamRoleType): UserTeamRoleType {
    switch (btUserTeamRoleType) {
        case BTUserTeamRoleType.Lead:
            return UserTeamRoleType.Lead;
        case BTUserTeamRoleType.Manager:
            return UserTeamRoleType.Manager;
        case BTUserTeamRoleType.Member:
            return UserTeamRoleType.Member;
        default:
            throw new Error(`Unknown BTUserTeamRoleType: ${btUserTeamRoleType}`);
    }
}

export function mapToBTUserTeamRoleType(userTeamRoleType: UserTeamRoleType): BTUserTeamRoleType {
    switch (userTeamRoleType) {
        case UserTeamRoleType.Lead:
            return BTUserTeamRoleType.Lead;
        case UserTeamRoleType.Manager:
            return BTUserTeamRoleType.Manager;
        case UserTeamRoleType.Member:
            return BTUserTeamRoleType.Member;
        default:
            throw new Error(`Unknown UserTeamRoleType: ${userTeamRoleType}`);
    }
}
