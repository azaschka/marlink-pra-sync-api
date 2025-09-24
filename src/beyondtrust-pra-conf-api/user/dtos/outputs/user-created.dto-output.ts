import { Expose } from 'class-transformer';
import {
    UserAllowedAccessPermissionType,
    UserEndpointAutomationPermissionType,
    UserViewSupportReportsPermissionType,
    UserViewVaultReportsPermissionType,
} from '../../enums';

export class UserCreatedDtoOutput {
    @Expose({ name: 'public_display_name' })
    public publicDisplayName!: string;

    public id!: number;

    @Expose({ name: 'security_provider_id' })
    public securityProviderId?: number;

    public username?: string;

    @Expose({ name: 'password_expiration' })
    public passwordExpiration?: Date | null;

    @Expose({ name: 'email_address' })
    public emailAddress?: string;

    @Expose({ name: 'preferred_email_language' })
    public preferredEmailLanguage?: string;

    @Expose({ name: 'two_factor_required' })
    public twoFactorRequired?: boolean;

    public enabled?: boolean;

    @Expose({ name: 'last_authentication' })
    public lastAuthentication?: Date;

    @Expose({ name: 'failed_logins' })
    public failedLogins?: number;

    @Expose({ name: 'password_reset_next_login' })
    public passwordResetNextLogin?: boolean;

    @Expose({ name: 'created_at' })
    public createdAt?: Date;

    @Expose({ name: 'two_factor_enabled' })
    public twoFactorEnabled?: boolean;

    @Expose({ name: 'fido2_credential_count' })
    public fido2CredentialCount?: number;

    @Expose({ name: 'fido2_last_used_date' })
    public fido2LastUsedDate?: Date;

    @Expose({ name: 'perm_admin' })
    public permAdmin?: boolean;

    @Expose({ name: 'perm_set_passwords' })
    public permSetPasswords?: boolean;

    @Expose({ name: 'perm_admin_pushagents' })
    public permAdminPushagents?: boolean;

    @Expose({ name: 'perm_view_support_reports' })
    public permViewSupportReports?: UserViewSupportReportsPermissionType;

    @Expose({ name: 'perm_view_vault_reports' })
    public permViewVaultReports?: UserViewVaultReportsPermissionType;

    @Expose({ name: 'perm_view_syslog_reports' })
    public permViewSyslogReports?: boolean;

    @Expose({ name: 'perm_view_sd_recordings' })
    public permViewSdRecordings?: boolean;

    @Expose({ name: 'perm_edit_jump_groups' })
    public permEditJumpGroups?: boolean;

    @Expose({ name: 'perm_edit_sd_teams' })
    public permEditSdTeams?: boolean;

    @Expose({ name: 'perm_edit_canned_scripts' })
    public permEditCannedScripts?: boolean;

    @Expose({ name: 'perm_edit_custom_rep_links' })
    public permEditCustomRepLinks?: boolean;

    @Expose({ name: 'perm_access_allowed' })
    public permAccessAllowed?: UserAllowedAccessPermissionType;

    @Expose({ name: 'perm_share_other_team' })
    public permShareOtherTeam?: boolean;

    @Expose({ name: 'perm_invite_external_user' })
    public permInviteExternalUser?: boolean;

    @Expose({ name: 'perm_extended_availability_mode_allowed' })
    public permExtendedAvailabilityModeAllowed?: boolean;

    @Expose({ name: 'perm_edit_external_key' })
    public permEditExternalKey?: boolean;

    @Expose({ name: 'perm_session_idle_timeout' })
    public permSessionIdleTimeout?: number;

    @Expose({ name: 'perm_collaborate' })
    public permCollaborate?: boolean;

    @Expose({ name: 'perm_collaborate_control' })
    public permCollaborateControl?: boolean;

    @Expose({ name: 'perm_jump_client' })
    public permJumpClient?: boolean;

    @Expose({ name: 'perm_local_jump' })
    public permLocalJump?: boolean;

    @Expose({ name: 'perm_remote_jump' })
    public permRemoteJump?: boolean;

    @Expose({ name: 'perm_remote_vnc' })
    public permRemoteVnc?: boolean;

    @Expose({ name: 'perm_remote_rdp' })
    public permRemoteRdp?: boolean;

    @Expose({ name: 'perm_shell_jump' })
    public permShellJump?: boolean;

    @Expose({ name: 'default_jump_item_role_id' })
    public defaultJumpItemRoleId?: number;

    @Expose({ name: 'private_jump_item_role_id' })
    public privateJumpItemRoleId?: number;

    @Expose({ name: 'inferior_jump_item_role_id' })
    public inferiorJumpItemRoleId?: number;

    @Expose({ name: 'unassigned_jump_item_role_id' })
    public unassignedJumpItemRoleId?: number;

    @Expose({ name: 'perm_web_jump' })
    public permWebJump?: boolean;

    @Expose({ name: 'perm_protocol_tunnel' })
    public permProtocolTunnel?: boolean;

    @Expose({ name: 'perm_sd_static_port_for_external_tools' })
    public permSdStaticPortForExternalTools?: boolean;

    @Expose({ name: 'perm_vault' })
    public permVault?: boolean;

    @Expose({ name: 'perm_endpoint_automation' })
    public permEndpointAutomation?: UserEndpointAutomationPermissionType;
}
