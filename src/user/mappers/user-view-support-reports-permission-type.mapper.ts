import { UserViewSupportReportsPermissionType as BTUserViewSupportReportsPermissionType } from '../../beyondtrust-pra-conf-api/user/enums';
import { UserViewSupportReportsPermissionType } from '../enums';

export function mapFromBTUserViewSupportReportsPermissionType(
    btUserViewSupportReportsPermissionType: BTUserViewSupportReportsPermissionType,
): UserViewSupportReportsPermissionType {
    switch (btUserViewSupportReportsPermissionType) {
        case BTUserViewSupportReportsPermissionType.NotAllowed:
            return UserViewSupportReportsPermissionType.NotAllowed;
        case BTUserViewSupportReportsPermissionType.UserSessions:
            return UserViewSupportReportsPermissionType.UserSessions;
        case BTUserViewSupportReportsPermissionType.AllSessions:
            return UserViewSupportReportsPermissionType.AllSessions;
        case BTUserViewSupportReportsPermissionType.TeamSessions:
            return UserViewSupportReportsPermissionType.TeamSessions;
        case BTUserViewSupportReportsPermissionType.JumpGroupSessions:
            return UserViewSupportReportsPermissionType.JumpGroupSessions;
        default:
            throw new Error(
                `Unknown BTUserViewSupportReportsPermissionType: ${btUserViewSupportReportsPermissionType}`,
            );
    }
}
