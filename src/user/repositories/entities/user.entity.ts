import { UserRetrievedDtoOutput as BTUser } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import { GroupPolicyMemberEntity } from '../../../group-policy-member/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { TeamUserEntity } from '../../../team-user/repositories/entities';
import { UserGroupPolicyEntity } from '../../../user-group-policy/repositories/entities';
import {
    UserAllowedAccessPermissionType,
    UserEndpointAutomationPermissionType,
    UserViewSupportReportsPermissionType,
    UserViewVaultReportsPermissionType,
} from '../../enums';
import {
    mapFromBTUserAllowedAccessPermissionType,
    mapFromBTUserEndpointAutomationPermissionType,
    mapFromBTUserViewSupportReportsPermissionType,
    mapFromBTUserViewVaultReportsPermissionType,
} from '../../mappers';
import { User } from '../../models';

export class UserEntity implements User {
    public id!: number;
    public publicDisplayName!: string;
    public securityProviderId?: number;
    public username?: string;
    public passwordExpirationDate?: Date | null;
    public email?: string;
    public preferredEmailLanguage?: string;
    public isTwoFactorAuthRequired?: boolean;
    public isLoginAllowed?: boolean;
    public lastAuthenticationDate?: Date;
    public failedLoginAttempts?: number;
    public mustResetPasswordOnNextLogin?: boolean;
    public creationDate?: Date;
    public hasTwoFactorAuthEnabled?: boolean;
    public fido2CredentialCount?: number;
    public fido2LastUsedDate?: Date;
    public hasAdminPermission?: boolean;
    public hasSetPasswordsPermission?: boolean;
    public hasAdminPushagentPermission?: boolean;
    public viewSupportReportsPermissionType?: UserViewSupportReportsPermissionType;
    public viewVaultReportsPermissionType?: UserViewVaultReportsPermissionType;
    public hasViewSyslogReportsPermission?: boolean;
    public hasViewSdRecordingsPermission?: boolean;
    public hasEditJumpGroupsPermission?: boolean;
    public hasEditSdTeamsPermission?: boolean;
    public hasEditCannedScriptsPermission?: boolean;
    public hasEditCustomRepLinksPermission?: boolean;
    public allowedAccessPermissionType?: UserAllowedAccessPermissionType;
    public hasShareOtherTeamPermission?: boolean;
    public hasInviteExternalUserPermission?: boolean;
    public hasExtendedAvailabilityModeAllowedPermission?: boolean;
    public hasEditExternalKeyPermission?: boolean;
    public sessionInactivityTimeoutInSeconds?: number;
    public hasCollaboratePermission?: boolean;
    public hasCollaborateControlPermission?: boolean;
    public hasJumpClientPermission?: boolean;
    public hasLocalJumpPermission?: boolean;
    public hasRemoteJumpPermission?: boolean;
    public hasRemoteVncPermission?: boolean;
    public hasRemoteRdpPermission?: boolean;
    public hasShellJumpPermission?: boolean;
    public defaultJumpItemRoleId?: number;
    public privateJumpItemRoleId?: number;
    public inferiorJumpItemRoleId?: number;
    public unassignedJumpItemRoleId?: number;
    public hasWebJumpPermission?: boolean;
    public hasProtocolTunnelPermission?: boolean;
    public hasSdStaticPortForExternalToolsPermission?: boolean;
    public hasVaultPermission?: boolean;
    public endpointAutomationPermissionType?: UserEndpointAutomationPermissionType;
    public lastSyncDate!: Date;
    public userGroupPolicies?: UserGroupPolicyEntity[];
    public teamUsers?: TeamUserEntity[];
    public groupPolicyMembers?: GroupPolicyMemberEntity[];

    public static create(
        id: number,
        publicDisplayName: string,
        securityProviderId?: number,
        username?: string,
        passwordExpirationDate?: Date | null,
        email?: string,
        preferredEmailLanguage?: string,
        isTwoFactorAuthRequired?: boolean,
        isLoginAllowed?: boolean,
        lastAuthenticationDate?: Date,
        failedLoginAttempts?: number,
        mustResetPasswordOnNextLogin?: boolean,
        creationDate?: Date,
        hasTwoFactorAuthEnabled?: boolean,
        fido2CredentialCount?: number,
        fido2LastUsedDate?: Date,
        hasAdminPermission?: boolean,
        hasSetPasswordsPermission?: boolean,
        hasAdminPushagentPermission?: boolean,
        viewSupportReportsPermissionType?: UserViewSupportReportsPermissionType,
        viewVaultReportsPermissionType?: UserViewVaultReportsPermissionType,
        hasViewSyslogReportsPermission?: boolean,
        hasViewSdRecordingsPermission?: boolean,
        hasEditJumpGroupsPermission?: boolean,
        hasEditSdTeamsPermission?: boolean,
        hasEditCannedScriptsPermission?: boolean,
        hasEditCustomRepLinksPermission?: boolean,
        allowedAccessPermissionType?: UserAllowedAccessPermissionType,
        hasShareOtherTeamPermission?: boolean,
        hasInviteExternalUserPermission?: boolean,
        hasExtendedAvailabilityModeAllowedPermission?: boolean,
        hasEditExternalKeyPermission?: boolean,
        sessionInactivityTimeoutInSeconds?: number,
        hasCollaboratePermission?: boolean,
        hasCollaborateControlPermission?: boolean,
        hasJumpClientPermission?: boolean,
        hasLocalJumpPermission?: boolean,
        hasRemoteJumpPermission?: boolean,
        hasRemoteVncPermission?: boolean,
        hasRemoteRdpPermission?: boolean,
        hasShellJumpPermission?: boolean,
        defaultJumpItemRoleId?: number,
        privateJumpItemRoleId?: number,
        inferiorJumpItemRoleId?: number,
        unassignedJumpItemRoleId?: number,
        hasWebJumpPermission?: boolean,
        hasProtocolTunnelPermission?: boolean,
        hasSdStaticPortForExternalToolsPermission?: boolean,
        hasVaultPermission?: boolean,
        endpointAutomationPermissionType?: UserEndpointAutomationPermissionType,
    ): UserEntity {
        const entity = new UserEntity();
        entity.id = id;
        entity.publicDisplayName = publicDisplayName;
        entity.securityProviderId = securityProviderId;
        entity.username = username;
        entity.passwordExpirationDate = passwordExpirationDate;
        entity.email = email;
        entity.preferredEmailLanguage = preferredEmailLanguage;
        entity.isTwoFactorAuthRequired = isTwoFactorAuthRequired;
        entity.isLoginAllowed = isLoginAllowed;
        entity.lastAuthenticationDate = lastAuthenticationDate;
        entity.failedLoginAttempts = failedLoginAttempts;
        entity.mustResetPasswordOnNextLogin = mustResetPasswordOnNextLogin;
        entity.creationDate = creationDate;
        entity.hasTwoFactorAuthEnabled = hasTwoFactorAuthEnabled;
        entity.fido2CredentialCount = fido2CredentialCount;
        entity.fido2LastUsedDate = fido2LastUsedDate;
        entity.hasAdminPermission = hasAdminPermission;
        entity.hasSetPasswordsPermission = hasSetPasswordsPermission;
        entity.hasAdminPushagentPermission = hasAdminPushagentPermission;
        entity.viewSupportReportsPermissionType = viewSupportReportsPermissionType;
        entity.viewVaultReportsPermissionType = viewVaultReportsPermissionType;
        entity.hasViewSyslogReportsPermission = hasViewSyslogReportsPermission;
        entity.hasViewSdRecordingsPermission = hasViewSdRecordingsPermission;
        entity.hasEditJumpGroupsPermission = hasEditJumpGroupsPermission;
        entity.hasEditSdTeamsPermission = hasEditSdTeamsPermission;
        entity.hasEditCannedScriptsPermission = hasEditCannedScriptsPermission;
        entity.hasEditCustomRepLinksPermission = hasEditCustomRepLinksPermission;
        entity.allowedAccessPermissionType = allowedAccessPermissionType;
        entity.hasShareOtherTeamPermission = hasShareOtherTeamPermission;
        entity.hasInviteExternalUserPermission = hasInviteExternalUserPermission;
        entity.hasExtendedAvailabilityModeAllowedPermission = hasExtendedAvailabilityModeAllowedPermission;
        entity.hasEditExternalKeyPermission = hasEditExternalKeyPermission;
        entity.sessionInactivityTimeoutInSeconds = sessionInactivityTimeoutInSeconds;
        entity.hasCollaboratePermission = hasCollaboratePermission;
        entity.hasCollaborateControlPermission = hasCollaborateControlPermission;
        entity.hasJumpClientPermission = hasJumpClientPermission;
        entity.hasLocalJumpPermission = hasLocalJumpPermission;
        entity.hasRemoteJumpPermission = hasRemoteJumpPermission;
        entity.hasRemoteVncPermission = hasRemoteVncPermission;
        entity.hasRemoteRdpPermission = hasRemoteRdpPermission;
        entity.hasShellJumpPermission = hasShellJumpPermission;
        entity.defaultJumpItemRoleId = defaultJumpItemRoleId;
        entity.privateJumpItemRoleId = privateJumpItemRoleId;
        entity.inferiorJumpItemRoleId = inferiorJumpItemRoleId;
        entity.unassignedJumpItemRoleId = unassignedJumpItemRoleId;
        entity.hasWebJumpPermission = hasWebJumpPermission;
        entity.hasProtocolTunnelPermission = hasProtocolTunnelPermission;
        entity.hasSdStaticPortForExternalToolsPermission = hasSdStaticPortForExternalToolsPermission;
        entity.hasVaultPermission = hasVaultPermission;
        entity.endpointAutomationPermissionType = endpointAutomationPermissionType;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }

    public static createFromBT(btUser: BTUser) {
        return UserEntity.create(
            btUser.id,
            btUser.publicDisplayName,
            btUser.securityProviderId,
            btUser.username,
            btUser.passwordExpiration ? new Date(btUser.passwordExpiration) : btUser.passwordExpiration,
            btUser.emailAddress,
            btUser.preferredEmailLanguage,
            btUser.twoFactorRequired,
            btUser.enabled,
            btUser.lastAuthentication ? new Date(btUser.lastAuthentication) : btUser.lastAuthentication,
            btUser.failedLogins,
            btUser.passwordResetNextLogin,
            btUser.createdAt ? new Date(btUser.createdAt) : btUser.createdAt,
            btUser.twoFactorEnabled,
            btUser.fido2CredentialCount,
            btUser.fido2LastUsedDate ? new Date(btUser.fido2LastUsedDate) : btUser.fido2LastUsedDate,
            btUser.permAdmin,
            btUser.permSetPasswords,
            btUser.permAdminPushagents,
            btUser.permViewSupportReports
                ? mapFromBTUserViewSupportReportsPermissionType(btUser.permViewSupportReports)
                : undefined,
            btUser.permViewVaultReports
                ? mapFromBTUserViewVaultReportsPermissionType(btUser.permViewVaultReports)
                : undefined,
            btUser.permViewSyslogReports,
            btUser.permViewSdRecordings,
            btUser.permEditJumpGroups,
            btUser.permEditSdTeams,
            btUser.permEditCannedScripts,
            btUser.permEditCustomRepLinks,
            btUser.permAccessAllowed ? mapFromBTUserAllowedAccessPermissionType(btUser.permAccessAllowed) : undefined,
            btUser.permShareOtherTeam,
            btUser.permInviteExternalUser,
            btUser.permExtendedAvailabilityModeAllowed,
            btUser.permEditExternalKey,
            btUser.permSessionIdleTimeout,
            btUser.permCollaborate,
            btUser.permCollaborateControl,
            btUser.permJumpClient,
            btUser.permLocalJump,
            btUser.permRemoteJump,
            btUser.permRemoteVnc,
            btUser.permRemoteRdp,
            btUser.permShellJump,
            btUser.defaultJumpItemRoleId,
            btUser.privateJumpItemRoleId,
            btUser.inferiorJumpItemRoleId,
            btUser.unassignedJumpItemRoleId,
            btUser.permWebJump,
            btUser.permProtocolTunnel,
            btUser.permSdStaticPortForExternalTools,
            btUser.permVault,
            btUser.permEndpointAutomation
                ? mapFromBTUserEndpointAutomationPermissionType(btUser.permEndpointAutomation)
                : undefined,
        );
    }
}
