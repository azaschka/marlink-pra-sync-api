import { Expose } from 'class-transformer';
import { AccessPermissionStatusType } from '../../enums';

export class GroupPolicyRetrievedDtoOutput {
    public name!: string;

    public id!: number;

    @Expose({ name: 'perm_access_allowed' })
    public permAccessAllowed?: boolean;

    @Expose({ name: 'access_perm_status' })
    public accessPermStatus?: AccessPermissionStatusType;

    @Expose({ name: 'perm_share_other_team' })
    public permShareOtherTeam?: boolean;

    @Expose({ name: 'perm_invite_external_user' })
    public permInviteExternalUser?: boolean;

    @Expose({ name: 'perm_session_idle_timeout' })
    public permSessionIdleTimeout?: number;

    @Expose({ name: 'perm_extended_availability_mode_allowed' })
    public permExtendedAvailabilityModeAllowed?: boolean;

    @Expose({ name: 'perm_edit_external_key' })
    public permEditExternalKey?: boolean;

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

    @Expose({ name: 'perm_web_jump' })
    public permWebJump?: boolean;

    @Expose({ name: 'perm_protocol_tunnel' })
    public permProtocolTunnel?: boolean;

    @Expose({ name: 'perm_sd_static_port_for_external_tools' })
    public permSdStaticPortForExternalTools?: boolean;

    @Expose({ name: 'default_jump_item_role_id' })
    public defaultJumpItemRoleId?: number;

    @Expose({ name: 'private_jump_item_role_id' })
    public privateJumpItemRoleId?: number;

    @Expose({ name: 'inferior_jump_item_role_id' })
    public inferiorJumpItemRoleId?: number;

    @Expose({ name: 'unassigned_jump_item_role_id' })
    public unassignedJumpItemRoleId?: number;
}
