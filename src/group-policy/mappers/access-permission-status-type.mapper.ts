import { AccessPermissionStatusType as BTAccessPermissionStatusType } from '../../beyondtrust-pra-conf-api/group-policy/enums';
import { AccessPermissionStatusType } from '../enums';

export function mapFromBTAccessPermissionStatusType(
    btAccessPermissionStatusType: BTAccessPermissionStatusType,
): AccessPermissionStatusType {
    switch (btAccessPermissionStatusType) {
        case BTAccessPermissionStatusType.Defined:
            return AccessPermissionStatusType.Defined;
        case BTAccessPermissionStatusType.Final:
            return AccessPermissionStatusType.Final;
        case BTAccessPermissionStatusType.NotDefined:
            return AccessPermissionStatusType.NotDefined;
        default:
            throw new Error(`Unknown BTAccessPermissionStatusType: ${btAccessPermissionStatusType}`);
    }
}
