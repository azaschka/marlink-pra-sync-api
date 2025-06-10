import { Column, Entity, OneToMany } from 'typeorm';
import { DateUtility } from '../../../shared/utilities';
import { UserGroupPolicyEntity } from '../../../user-group-policy/repositories/entities';
import { AccessPermissionStatusType } from '../../enums';
import { GroupPolicy } from '../../models';

@Entity({ name: 'group_policies' })
export class GroupPolicyEntity implements GroupPolicy {
    @Column({ name: 'id', type: 'int', unique: true, primary: true, generated: false })
    public id!: number;

    @Column({ name: 'name', type: 'varchar' })
    public name!: string;

    @Column({ name: 'has_endpoints_access_permission', type: 'boolean', nullable: true })
    public hasEndpointsAccessPermission?: boolean;

    @Column({ name: 'access_permission_status_type', type: 'enum', enum: AccessPermissionStatusType, nullable: true })
    public accessPermissionStatusType?: AccessPermissionStatusType;

    @Column({ name: 'has_share_other_team_permission', type: 'boolean', nullable: true })
    public hasShareOtherTeamPermission?: boolean;

    @Column({ name: 'has_invite_external_user_permission', type: 'boolean', nullable: true })
    public hasInviteExternalUserPermission?: boolean;

    @Column({ name: 'user_session_idle_timeout_in_seconds', type: 'int', nullable: true })
    public userSessionIdleTimeoutInSeconds?: number;

    @Column({ name: 'has_enable_extended_availability_mode_permission', type: 'boolean', nullable: true })
    public hasEnableExtendedAvailabilityModePermission?: boolean;

    @Column({ name: 'has_edit_external_key_permission', type: 'boolean', nullable: true })
    public hasEditExternalKeyPermission?: boolean;

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

    @Column({ name: 'has_web_jump_permission', type: 'boolean', nullable: true })
    public hasWebJumpPermission?: boolean;

    @Column({ name: 'has_protocol_tunnel_permission', type: 'boolean', nullable: true })
    public hasProtocolTunnelPermission?: boolean;

    @Column({ name: 'has_sd_static_port_for_external_tools_permission', type: 'boolean', nullable: true })
    public hasSdStaticPortForExternalToolsPermission?: boolean;

    @Column({ name: 'default_jump_item_role_id', type: 'int', nullable: true })
    public defaultJumpItemRoleId?: number;

    @Column({ name: 'private_jump_item_role_id', type: 'int', nullable: true })
    public privateJumpItemRoleId?: number;

    @Column({ name: 'inferior_jump_item_role_id', type: 'int', nullable: true })
    public inferiorJumpItemRoleId?: number;

    @Column({ name: 'unassigned_jump_item_role_id', type: 'int', nullable: true })
    public unassignedJumpItemRoleId?: number;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    @OneToMany(() => UserGroupPolicyEntity, (userGroupPolicy) => userGroupPolicy.groupPolicy)
    public userGroupPolicies!: UserGroupPolicyEntity[];

    public static create(
        id: number,
        name: string,
        hasEndpointsAccessPermission?: boolean,
        accessPermissionStatusType?: AccessPermissionStatusType,
        hasShareOtherTeamPermission?: boolean,
        hasInviteExternalUserPermission?: boolean,
        userSessionIdleTimeoutInSeconds?: number,
        hasEnableExtendedAvailabilityModePermission?: boolean,
        hasEditExternalKeyPermission?: boolean,
        hasCollaboratePermission?: boolean,
        hasCollaborateControlPermission?: boolean,
        hasJumpClientPermission?: boolean,
        hasLocalJumpPermission?: boolean,
        hasRemoteJumpPermission?: boolean,
        hasRemoteVncPermission?: boolean,
        hasRemoteRdpPermission?: boolean,
        hasShellJumpPermission?: boolean,
        hasWebJumpPermission?: boolean,
        hasProtocolTunnelPermission?: boolean,
        hasSdStaticPortForExternalToolsPermission?: boolean,
        defaultJumpItemRoleId?: number,
        privateJumpItemRoleId?: number,
        inferiorJumpItemRoleId?: number,
        unassignedJumpItemRoleId?: number,
    ): GroupPolicyEntity {
        const entity = new GroupPolicyEntity();
        entity.id = id;
        entity.name = name;
        entity.hasEndpointsAccessPermission = hasEndpointsAccessPermission;
        entity.accessPermissionStatusType = accessPermissionStatusType;
        entity.hasShareOtherTeamPermission = hasShareOtherTeamPermission;
        entity.hasInviteExternalUserPermission = hasInviteExternalUserPermission;
        entity.userSessionIdleTimeoutInSeconds = userSessionIdleTimeoutInSeconds;
        entity.hasEnableExtendedAvailabilityModePermission = hasEnableExtendedAvailabilityModePermission;
        entity.hasEditExternalKeyPermission = hasEditExternalKeyPermission;
        entity.hasCollaboratePermission = hasCollaboratePermission;
        entity.hasCollaborateControlPermission = hasCollaborateControlPermission;
        entity.hasJumpClientPermission = hasJumpClientPermission;
        entity.hasLocalJumpPermission = hasLocalJumpPermission;
        entity.hasRemoteJumpPermission = hasRemoteJumpPermission;
        entity.hasRemoteVncPermission = hasRemoteVncPermission;
        entity.hasRemoteRdpPermission = hasRemoteRdpPermission;
        entity.hasShellJumpPermission = hasShellJumpPermission;
        entity.hasWebJumpPermission = hasWebJumpPermission;
        entity.hasProtocolTunnelPermission = hasProtocolTunnelPermission;
        entity.hasSdStaticPortForExternalToolsPermission = hasSdStaticPortForExternalToolsPermission;
        entity.defaultJumpItemRoleId = defaultJumpItemRoleId;
        entity.privateJumpItemRoleId = privateJumpItemRoleId;
        entity.inferiorJumpItemRoleId = inferiorJumpItemRoleId;
        entity.unassignedJumpItemRoleId = unassignedJumpItemRoleId;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
