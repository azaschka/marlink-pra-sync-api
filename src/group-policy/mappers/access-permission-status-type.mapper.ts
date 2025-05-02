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

export function mapToBTAccessPermissionStatusType(
    accessPermissionStatusType: AccessPermissionStatusType,
): BTAccessPermissionStatusType {
    switch (accessPermissionStatusType) {
        case AccessPermissionStatusType.Defined:
            return BTAccessPermissionStatusType.Defined;
        case AccessPermissionStatusType.Final:
            return BTAccessPermissionStatusType.Final;
        case AccessPermissionStatusType.NotDefined:
            return BTAccessPermissionStatusType.NotDefined;
        default:
            throw new Error(`Unknown AccessPermissionStatusType: ${accessPermissionStatusType}`);
    }
}
