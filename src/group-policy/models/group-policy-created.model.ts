import { AccessPermissionStatusType } from '../enums';

export interface GroupPolicyCreated {
    name: string;
    id?: number;
    hasEndpointsAccessPermission?: boolean;
    accessPermissionStatusType?: AccessPermissionStatusType;
    hasShareOtherTeamPermission?: boolean;
    hasInviteExternalUserPermission?: boolean;
    userSessionIdleTimeoutInSeconds?: number;
    hasEnableExtendedAvailabilityModePermission?: boolean;
    hasEditExternalKeyPermission?: boolean;
    hasCollaboratePermission?: boolean;
    hasCollaborateControlPermission?: boolean;
    hasJumpClientPermission?: boolean;
    hasLocalJumpPermission?: boolean;
    hasRemoteJumpPermission?: boolean;
    hasRemoteVncPermission?: boolean;
    hasRemoteRdpPermission?: boolean;
    hasShellJumpPermission?: boolean;
    hasWebJumpPermission?: boolean;
    hasProtocolTunnelPermission?: boolean;
    hasSdStaticPortForExternalToolsPermission?: boolean;
    defaultJumpItemRoleId?: number;
    privateJumpItemRoleId?: number;
    inferiorJumpItemRoleId?: number;
    unassignedJumpItemRoleId?: number;
}
