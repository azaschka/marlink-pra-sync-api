import { UserEndpointAutomationPermissionType as BTUserEndpointAutomationPermissionType } from '../../beyondtrust-pra-conf-api/user/enums';
import { UserEndpointAutomationPermissionType } from '../enums';

export function mapFromBTUserEndpointAutomationPermissionType(
    btUserEndpointAutomationPermissionType: BTUserEndpointAutomationPermissionType,
): UserEndpointAutomationPermissionType {
    switch (btUserEndpointAutomationPermissionType) {
        case BTUserEndpointAutomationPermissionType.NotAllowed:
            return UserEndpointAutomationPermissionType.NotAllowed;
        case BTUserEndpointAutomationPermissionType.Administrator:
            return UserEndpointAutomationPermissionType.Administrator;
        case BTUserEndpointAutomationPermissionType.User:
            return UserEndpointAutomationPermissionType.User;
        default:
            throw new Error(
                `Unknown BTUserEndpointAutomationPermissionType: ${btUserEndpointAutomationPermissionType}`,
            );
    }
}
