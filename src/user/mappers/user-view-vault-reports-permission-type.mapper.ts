import { UserViewVaultReportsPermissionType as BTUserViewVaultReportsPermissionType } from '../../beyondtrust-pra-conf-api/user/enums';
import { UserViewVaultReportsPermissionType } from '../enums';

export function mapFromBTUserViewVaultReportsPermissionType(
    btUserViewVaultReportsPermissionType: BTUserViewVaultReportsPermissionType,
): UserViewVaultReportsPermissionType {
    switch (btUserViewVaultReportsPermissionType) {
        case BTUserViewVaultReportsPermissionType.NotAllowed:
            return UserViewVaultReportsPermissionType.NotAllowed;
        case BTUserViewVaultReportsPermissionType.ViewUserEvents:
            return UserViewVaultReportsPermissionType.ViewUserEvents;
        case BTUserViewVaultReportsPermissionType.ViewAllEvents:
            return UserViewVaultReportsPermissionType.ViewAllEvents;
        default:
            throw new Error(`Unknown BTUserViewVaultReportsPermissionType: ${btUserViewVaultReportsPermissionType}`);
    }
}
