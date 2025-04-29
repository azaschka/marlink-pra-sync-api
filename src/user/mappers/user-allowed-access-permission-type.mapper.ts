import { UserAllowedAccessPermissionType as BTUserAllowedAccessPermissionType } from '../../beyondtrust-pra-conf-api/user/enums';
import { UserAllowedAccessPermissionType } from '../enums';

export function mapFromBTUserAllowedAccessPermissionType(
    btUserAllowedAccessPermissionType: BTUserAllowedAccessPermissionType,
): UserAllowedAccessPermissionType {
    switch (btUserAllowedAccessPermissionType) {
        case BTUserAllowedAccessPermissionType.NotAllowed:
            return UserAllowedAccessPermissionType.NotAllowed;
        case BTUserAllowedAccessPermissionType.FullSupport:
            return UserAllowedAccessPermissionType.FullSupport;
        default:
            throw new Error(`Unknown BTUserAllowedAccessPermissionType: ${btUserAllowedAccessPermissionType}`);
    }
}
