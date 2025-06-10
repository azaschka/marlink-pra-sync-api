import { Column, Entity, OneToMany } from 'typeorm';
import { DateUtility } from '../../../shared/utilities';
import { UserGroupPolicyEntity } from '../../../user-group-policy/repositories/entities';
import {
    UserAllowedAccessPermissionType,
    UserViewSupportReportsPermissionType,
    UserViewVaultReportsPermissionType,
} from '../../enums';
import { User } from '../../models';

@Entity({ name: 'users' })
export class UserEntity implements User {
    @Column({ name: 'id', type: 'int', unique: true, primary: true, generated: false })
    public id!: number;

    @Column({ name: 'public_display_name', type: 'varchar' })
    public publicDisplayName!: string;

    @Column({ name: 'security_provider_id', type: 'int', nullable: true })
    public securityProviderId?: number;

    @Column({ name: 'username', type: 'varchar', nullable: true })
    public username?: string;

    @Column({ name: 'password_expiration_date', type: 'timestamp', nullable: true })
    public passwordExpirationDate?: Date | null;

    @Column({ name: 'email', type: 'varchar', nullable: true })
    public email?: string;

    @Column({ name: 'preferred_email_language', type: 'varchar', nullable: true })
    public preferredEmailLanguage?: string;

    @Column({ name: 'is_two_factor_auth_required', type: 'boolean', nullable: true })
    public isTwoFactorAuthRequired?: boolean;

    @Column({ name: 'is_login_allowed', type: 'boolean', nullable: true })
    public isLoginAllowed?: boolean;

    @Column({ name: 'last_authentication_date', type: 'timestamp', nullable: true })
    public lastAuthenticationDate?: Date;

    @Column({ name: 'failed_login_attempts', type: 'int', nullable: true })
    public failedLoginAttempts?: number;

    @Column({ name: 'must_reset_password_on_next_login', type: 'boolean', nullable: true })
    public mustResetPasswordOnNextLogin?: boolean;

    @Column({ name: 'creation_date', type: 'timestamp', nullable: true })
    public creationDate?: Date;

    @Column({ name: 'has_two_factor_auth_enabled', type: 'boolean', nullable: true })
    public hasTwoFactorAuthEnabled?: boolean;

    @Column({ name: 'fido2_credential_count', type: 'int', nullable: true })
    public fido2CredentialCount?: number;

    @Column({ name: 'fido2_last_used_date', type: 'timestamp', nullable: true })
    public fido2LastUsedDate?: Date;

    @Column({ name: 'has_admin_permission', type: 'boolean', nullable: true })
    public hasAdminPermission?: boolean;

    @Column({ name: 'has_set_passwords_permission', type: 'boolean', nullable: true })
    public hasSetPasswordsPermission?: boolean;

    @Column({ name: 'has_admin_pushagent_permission', type: 'boolean', nullable: true })
    public hasAdminPushagentPermission?: boolean;

    @Column({
        name: 'view_support_reports_permission_type',
        type: 'enum',
        enum: UserViewSupportReportsPermissionType,
        nullable: true,
    })
    public viewSupportReportsPermissionType?: UserViewSupportReportsPermissionType;

    @Column({
        name: 'view_vault_reports_permission_type',
        type: 'enum',
        enum: UserViewVaultReportsPermissionType,
        nullable: true,
    })
    public viewVaultReportsPermissionType?: UserViewVaultReportsPermissionType;

    @Column({ name: 'has_view_syslog_reports_permission', type: 'boolean', nullable: true })
    public hasViewSyslogReportsPermission?: boolean;

    @Column({ name: 'has_view_sd_recordings_permission', type: 'boolean', nullable: true })
    public hasViewSdRecordingsPermission?: boolean;

    @Column({ name: 'has_edit_jump_groups_permission', type: 'boolean', nullable: true })
    public hasEditJumpGroupsPermission?: boolean;

    @Column({ name: 'has_edit_sd_teams_permission', type: 'boolean', nullable: true })
    public hasEditSdTeamsPermission?: boolean;

    @Column({ name: 'has_edit_canned_scripts_permission', type: 'boolean', nullable: true })
    public hasEditCannedScriptsPermission?: boolean;

    @Column({ name: 'has_edit_custom_rep_links_permission', type: 'boolean', nullable: true })
    public hasEditCustomRepLinksPermission?: boolean;

    @Column({
        name: 'allowed_access_permission_type',
        type: 'enum',
        enum: UserAllowedAccessPermissionType,
        nullable: true,
    })
    public allowedAccessPermissionType?: UserAllowedAccessPermissionType;

    @Column({ name: 'has_share_other_team_permission', type: 'boolean', nullable: true })
    public hasShareOtherTeamPermission?: boolean;

    @Column({ name: 'has_invite_external_user_permission', type: 'boolean', nullable: true })
    public hasInviteExternalUserPermission?: boolean;

    @Column({ name: 'has_extended_availability_mode_allowed_permission', type: 'boolean', nullable: true })
    public hasExtendedAvailabilityModeAllowedPermission?: boolean;

    @Column({ name: 'has_edit_external_key_permission', type: 'boolean', nullable: true })
    public hasEditExternalKeyPermission?: boolean;

    @Column({ name: 'has_session_idle_timeout_permission', type: 'int', nullable: true })
    public hasSessionIdleTimeoutPermission?: number;

    @Column({ name: 'has_collaborate_permission', type: 'boolean', nullable: true })
    public hasCollaboratePermission?: boolean;

    @Column({ name: 'has_collaborate_control_permission', type: 'boolean', nullable: true })
    public hasCollaborateControlPermission?: boolean;

    @Column({ name: 'has_jump_client_permission', type: 'boolean', nullable: true })
    public hasJumpClientPermission?: boolean;

    @Column({ name: 'has_local_jump_permission', type: 'boolean', nullable: true })
    public hasLocalJumpPermission?: boolean;

    @Column({ name: 'has_remote_jump_permission', type: 'boolean', nullable: true })
    public hasRemoteJumpPermission?: boolean;

    @Column({ name: 'has_remote_vnc_permission', type: 'boolean', nullable: true })
    public hasRemoteVncPermission?: boolean;

    @Column({ name: 'has_remote_rdp_permission', type: 'boolean', nullable: true })
    public hasRemoteRdpPermission?: boolean;

    @Column({ name: 'has_shell_jump_permission', type: 'boolean', nullable: true })
    public hasShellJumpPermission?: boolean;

    @Column({ name: 'default_jump_item_role_id', type: 'int', nullable: true })
    public defaultJumpItemRoleId?: number;

    @Column({ name: 'private_jump_item_role_id', type: 'int', nullable: true })
    public privateJumpItemRoleId?: number;

    @Column({ name: 'inferior_jump_item_role_id', type: 'int', nullable: true })
    public inferiorJumpItemRoleId?: number;

    @Column({ name: 'unassigned_jump_item_role_id', type: 'int', nullable: true })
    public unassignedJumpItemRoleId?: number;

    @Column({ name: 'has_web_jump_permission', type: 'boolean', nullable: true })
    public hasWebJumpPermission?: boolean;

    @Column({ name: 'has_protocol_tunnel_permission', type: 'boolean', nullable: true })
    public hasProtocolTunnelPermission?: boolean;

    @Column({ name: 'has_sd_static_port_for_external_tools_permission', type: 'boolean', nullable: true })
    public hasSdStaticPortForExternalToolsPermission?: boolean;

    @Column({ name: 'has_vault_permission', type: 'boolean', nullable: true })
    public hasVaultPermission?: boolean;

    @Column({ name: 'has_endpoint_automation_permission', type: 'boolean', nullable: true })
    public hasEndpointAutomationPermission?: boolean;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    @OneToMany(() => UserGroupPolicyEntity, (userGroupPolicy) => userGroupPolicy.user)
    public userGroupPolicies!: UserGroupPolicyEntity[];

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
        hasSessionIdleTimeoutPermission?: number,
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
        hasEndpointAutomationPermission?: boolean,
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
        entity.hasSessionIdleTimeoutPermission = hasSessionIdleTimeoutPermission;
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
        entity.hasEndpointAutomationPermission = hasEndpointAutomationPermission;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
