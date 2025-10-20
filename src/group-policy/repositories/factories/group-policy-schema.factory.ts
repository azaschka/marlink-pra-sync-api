import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import { AccessPermissionStatusType } from '../../enums';
import { GroupPolicy } from '../../models';

export class GroupPolicySchemaFactory implements BaseTenantEntitySchemaFactory<GroupPolicy> {
    public static readonly TABLE_NAME = 'group_policies';

    public create(tenantId: number): EntitySchema<GroupPolicy> {
        return new EntitySchema<GroupPolicy>({
            name: `${GroupPolicySchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${GroupPolicySchemaFactory.TABLE_NAME}_${tenantId}`,
            columns: {
                id: {
                    type: 'int',
                    primary: true,
                    generated: undefined,
                    unique: true,
                },
                name: {
                    type: 'varchar',
                    nullable: false,
                },
                hasEndpointsAccessPermission: {
                    name: 'has_endpoints_access_permission',
                    type: 'boolean',
                    nullable: true,
                },
                accessPermissionStatusType: {
                    name: 'access_permission_status_type',
                    type: 'enum',
                    enum: AccessPermissionStatusType,
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
                userSessionIdleTimeoutInSeconds: {
                    name: 'user_session_idle_timeout_in_seconds',
                    type: 'int',
                    nullable: true,
                },
                hasEnableExtendedAvailabilityModePermission: {
                    name: 'has_enable_extended_availability_mode_permission',
                    type: 'boolean',
                    nullable: true,
                },
                hasEditExternalKeyPermission: {
                    name: 'has_edit_external_key_permission',
                    type: 'boolean',
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
                lastSyncDate: {
                    name: 'last_sync_date',
                    type: 'timestamp',
                    precision: 3,
                    nullable: false,
                    updateDate: true,
                },
            },
            relations: {
                userGroupPolicies: {
                    type: 'one-to-many',
                    target: `user_group_policies_${tenantId}`,
                    inverseSide: 'groupPolicy',
                },
                groupPolicyJumpoints: {
                    type: 'one-to-many',
                    target: `group_policy_jumpoints_${tenantId}`,
                    inverseSide: 'groupPolicy',
                },
                groupPolicyJumpGroups: {
                    type: 'one-to-many',
                    target: `group_policy_jump_groups_${tenantId}`,
                    inverseSide: 'groupPolicy',
                },
                groupPolicyMembers: {
                    type: 'one-to-many',
                    target: `group_policy_members_${tenantId}`,
                    inverseSide: 'groupPolicy',
                },
                groupPolicyTeams: {
                    type: 'one-to-many',
                    target: `group_policy_teams_${tenantId}`,
                    inverseSide: 'groupPolicy',
                },
            },
        });
    }
}
