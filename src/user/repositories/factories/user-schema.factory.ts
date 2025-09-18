import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import {
    UserAllowedAccessPermissionType,
    UserViewSupportReportsPermissionType,
    UserViewVaultReportsPermissionType,
} from '../../enums';
import { User } from '../../models';

export class UserSchemaFactory implements BaseTenantEntitySchemaFactory<User> {
    public static readonly TABLE_NAME = 'users';

    public create(tenantId: number): EntitySchema<User> {
        return new EntitySchema<User>({
            name: `${UserSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${UserSchemaFactory.TABLE_NAME}_${tenantId}`,
            columns: {
                id: {
                    name: 'id',
                    type: 'int',
                    primary: true,
                    generated: undefined,
                    unique: true,
                },
                publicDisplayName: {
                    name: 'public_display_name',
                    type: 'varchar',
                    nullable: false,
                },
                securityProviderId: {
                    name: 'security_provider_id',
                    type: 'int',
                    nullable: true,
                },
                username: {
                    name: 'username',
                    type: 'varchar',
                    nullable: true,
                },
                passwordExpirationDate: {
                    name: 'password_expiration_date',
                    type: 'timestamp',
                    nullable: true,
                },
                email: {
                    name: 'email',
                    type: 'varchar',
                    nullable: true,
                },
                preferredEmailLanguage: {
                    name: 'preferred_email_language',
                    type: 'varchar',
                    nullable: true,
                },
                isTwoFactorAuthRequired: {
                    name: 'is_two_factor_auth_required',
                    type: 'boolean',
                    nullable: true,
                },
                isLoginAllowed: {
                    name: 'is_login_allowed',
                    type: 'boolean',
                    nullable: true,
                },
                lastAuthenticationDate: {
                    name: 'last_authentication_date',
                    type: 'timestamp',
                    nullable: true,
                },
                failedLoginAttempts: {
                    name: 'failed_login_attempts',
                    type: 'int',
                    nullable: true,
                },
                mustResetPasswordOnNextLogin: {
                    name: 'must_reset_password_on_next_login',
                    type: 'boolean',
                    nullable: true,
                },
                creationDate: {
                    name: 'creation_date',
                    type: 'timestamp',
                    nullable: true,
                },
                hasTwoFactorAuthEnabled: {
                    name: 'has_two_factor_auth_enabled',
                    type: 'boolean',
                    nullable: true,
                },
                fido2CredentialCount: {
                    name: 'fido2_credential_count',
                    type: 'int',
                    nullable: true,
                },
                fido2LastUsedDate: {
                    name: 'fido2_last_used_date',
                    type: 'timestamp',
                    nullable: true,
                },
                hasAdminPermission: {
                    name: 'has_admin_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasSetPasswordsPermission: {
                    name: 'has_set_passwords_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasAdminPushagentPermission: {
                    name: 'has_admin_pushagent_permission',
                    type: 'boolean',
                    nullable: true,
                },
                viewSupportReportsPermissionType: {
                    name: 'view_support_reports_permission_type',
                    type: 'enum',
                    enum: UserViewSupportReportsPermissionType,
                    nullable: true,
                },
                viewVaultReportsPermissionType: {
                    name: 'view_vault_reports_permission_type',
                    type: 'enum',
                    enum: UserViewVaultReportsPermissionType,
                    nullable: true,
                },
                hasViewSyslogReportsPermission: {
                    name: 'has_view_syslog_reports_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasViewSdRecordingsPermission: {
                    name: 'has_view_sd_recordings_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasEditJumpGroupsPermission: {
                    name: 'has_edit_jump_groups_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasEditSdTeamsPermission: {
                    name: 'has_edit_sd_teams_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasEditCannedScriptsPermission: {
                    name: 'has_edit_canned_scripts_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasEditCustomRepLinksPermission: {
                    name: 'has_edit_custom_rep_links_permission',
                    type: 'boolean',
                    nullable: true,
                },
                allowedAccessPermissionType: {
                    name: 'allowed_access_permission_type',
                    type: 'enum',
                    enum: UserAllowedAccessPermissionType,
                    nullable: true,
                },
                hasShareOtherTeamPermission: {
                    name: 'has_share_other_team_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasInviteExternalUserPermission: {
                    name: 'has_invite_external_user_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasExtendedAvailabilityModeAllowedPermission: {
                    name: 'has_extended_availability_mode_allowed_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasEditExternalKeyPermission: {
                    name: 'has_edit_external_key_permission',
                    type: 'boolean',
                    nullable: true,
                },
                sessionInactivityTimeoutInSeconds: {
                    name: 'session_inactivity_timeout_in_seconds',
                    type: 'int',
                    nullable: true,
                },
                hasCollaboratePermission: {
                    name: 'has_collaborate_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasCollaborateControlPermission: {
                    name: 'has_collaborate_control_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasJumpClientPermission: {
                    name: 'has_jump_client_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasLocalJumpPermission: {
                    name: 'has_local_jump_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasRemoteJumpPermission: {
                    name: 'has_remote_jump_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasRemoteVncPermission: {
                    name: 'has_remote_vnc_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasRemoteRdpPermission: {
                    name: 'has_remote_rdp_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasShellJumpPermission: {
                    name: 'has_shell_jump_permission',
                    type: 'boolean',
                    nullable: true,
                },
                defaultJumpItemRoleId: {
                    name: 'default_jump_item_role_id',
                    type: 'int',
                    nullable: true,
                },
                privateJumpItemRoleId: {
                    name: 'private_jump_item_role_id',
                    type: 'int',
                    nullable: true,
                },
                inferiorJumpItemRoleId: {
                    name: 'inferior_jump_item_role_id',
                    type: 'int',
                    nullable: true,
                },
                unassignedJumpItemRoleId: {
                    name: 'unassigned_jump_item_role_id',
                    type: 'int',
                    nullable: true,
                },
                hasWebJumpPermission: {
                    name: 'has_web_jump_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasProtocolTunnelPermission: {
                    name: 'has_protocol_tunnel_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasSdStaticPortForExternalToolsPermission: {
                    name: 'has_sd_static_port_for_external_tools_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasVaultPermission: {
                    name: 'has_vault_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasEndpointAutomationPermission: {
                    name: 'has_endpoint_automation_permission',
                    type: 'boolean',
                    nullable: true,
                },
                lastSyncDate: {
                    name: 'last_sync_date',
                    type: 'timestamp',
                    precision: 3,
                    nullable: false,
                },
            },
            // relations: {
            //     userGroupPolicies: {
            //         type: 'one-to-many',
            //         target: `user_group_policies_${tenantId}`,
            //         inverseSide: 'user',
            //     },
            //     teamUsers: {
            //         type: 'one-to-many',
            //         target: `team_users_${tenantId}`,
            //         inverseSide: 'user',
            //     },
            //     groupPolicyMembers: {
            //         type: 'one-to-many',
            //         target: `group_policy_members_${tenantId}`,
            //         inverseSide: 'user',
            //     },
            // },
        });
    }
}
