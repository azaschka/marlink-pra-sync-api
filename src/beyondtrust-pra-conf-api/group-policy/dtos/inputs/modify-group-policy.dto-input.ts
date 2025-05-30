import { Expose } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { AccessPermissionStatusType } from '../../enums';

export class ModifyGroupPolicyDtoInput {
    @IsString()
    @IsOptional()
    public name?: string;

    @Expose({ name: 'perm_access_allowed' })
    @IsOptional()
    @IsBoolean()
    public permAccessAllowed?: boolean;

    @Expose({ name: 'access_perm_status' })
    @IsOptional()
    public accessPermStatus?: AccessPermissionStatusType;

    @Expose({ name: 'perm_share_other_team' })
    @IsOptional()
    @IsBoolean()
    public permShareOtherTeam?: boolean;

    @Expose({ name: 'perm_invite_external_user' })
    @IsOptional()
    @IsBoolean()
    public permInviteExternalUser?: boolean;

    @Expose({ name: 'perm_session_idle_timeout' })
    @IsOptional()
    @IsInt()
    public permSessionIdleTimeout?: number;

    @Expose({ name: 'perm_extended_availability_mode_allowed' })
    @IsOptional()
    @IsBoolean()
    public permExtendedAvailabilityModeAllowed?: boolean;

    @Expose({ name: 'perm_edit_external_key' })
    @IsOptional()
    @IsBoolean()
    public permEditExternalKey?: boolean;

    @Expose({ name: 'perm_collaborate' })
    @IsOptional()
    @IsBoolean()
    public permCollaborate?: boolean;

    @Expose({ name: 'perm_collaborate_control' })
    @IsOptional()
    @IsBoolean()
    public permCollaborateControl?: boolean;

    @Expose({ name: 'perm_jump_client' })
    @IsOptional()
    @IsBoolean()
    public permJumpClient?: boolean;

    @Expose({ name: 'perm_local_jump' })
    @IsOptional()
    @IsBoolean()
    public permLocalJump?: boolean;

    @Expose({ name: 'perm_remote_jump' })
    @IsOptional()
    @IsBoolean()
    public permRemoteJump?: boolean;

    @Expose({ name: 'perm_remote_vnc' })
    @IsOptional()
    @IsBoolean()
    public permRemoteVnc?: boolean;

    @Expose({ name: 'perm_remote_rdp' })
    @IsOptional()
    @IsBoolean()
    public permRemoteRdp?: boolean;

    @Expose({ name: 'perm_shell_jump' })
    @IsOptional()
    @IsBoolean()
    public permShellJump?: boolean;

    @Expose({ name: 'perm_web_jump' })
    @IsOptional()
    @IsBoolean()
    public permWebJump?: boolean;

    @Expose({ name: 'perm_protocol_tunnel' })
    @IsOptional()
    @IsBoolean()
    public permProtocolTunnel?: boolean;

    @Expose({ name: 'perm_sd_static_port_for_external_tools' })
    @IsOptional()
    @IsBoolean()
    public permSdStaticPortForExternalTools?: boolean;

    @Expose({ name: 'default_jump_item_role_id' })
    @IsOptional()
    @IsInt()
    public defaultJumpItemRoleId?: number;

    @Expose({ name: 'private_jump_item_role_id' })
    @IsOptional()
    @IsInt()
    public privateJumpItemRoleId?: number;

    @Expose({ name: 'inferior_jump_item_role_id' })
    @IsOptional()
    @IsInt()
    public inferiorJumpItemRoleId?: number;

    @Expose({ name: 'unassigned_jump_item_role_id' })
    @IsOptional()
    @IsInt()
    public unassignedJumpItemRoleId?: number;

    public static create(
        name?: string,
        permAccessAllowed?: boolean,
        accessPermStatus?: AccessPermissionStatusType,
        permShareOtherTeam?: boolean,
        permInviteExternalUser?: boolean,
        permSessionIdleTimeout?: number,
        permExtendedAvailabilityModeAllowed?: boolean,
        permEditExternalKey?: boolean,
        permCollaborate?: boolean,
        permCollaborateControl?: boolean,
        permJumpClient?: boolean,
        permLocalJump?: boolean,
        permRemoteJump?: boolean,
        permRemoteVnc?: boolean,
        permRemoteRdp?: boolean,
        permShellJump?: boolean,
        permWebJump?: boolean,
        permProtocolTunnel?: boolean,
        permSdStaticPortForExternalTools?: boolean,
        defaultJumpItemRoleId?: number,
        privateJumpItemRoleId?: number,
        inferiorJumpItemRoleId?: number,
        unassignedJumpItemRoleId?: number,
    ): ModifyGroupPolicyDtoInput {
        const dto = new ModifyGroupPolicyDtoInput();
        dto.name = name;
        dto.permAccessAllowed = permAccessAllowed;
        dto.accessPermStatus = accessPermStatus;
        dto.permShareOtherTeam = permShareOtherTeam;
        dto.permInviteExternalUser = permInviteExternalUser;
        dto.permSessionIdleTimeout = permSessionIdleTimeout;
        dto.permExtendedAvailabilityModeAllowed = permExtendedAvailabilityModeAllowed;
        dto.permEditExternalKey = permEditExternalKey;
        dto.permCollaborate = permCollaborate;
        dto.permCollaborateControl = permCollaborateControl;
        dto.permJumpClient = permJumpClient;
        dto.permLocalJump = permLocalJump;
        dto.permRemoteJump = permRemoteJump;
        dto.permRemoteVnc = permRemoteVnc;
        dto.permRemoteRdp = permRemoteRdp;
        dto.permShellJump = permShellJump;
        dto.permWebJump = permWebJump;
        dto.permProtocolTunnel = permProtocolTunnel;
        dto.permSdStaticPortForExternalTools = permSdStaticPortForExternalTools;
        dto.defaultJumpItemRoleId = defaultJumpItemRoleId;
        dto.privateJumpItemRoleId = privateJumpItemRoleId;
        dto.inferiorJumpItemRoleId = inferiorJumpItemRoleId;
        dto.unassignedJumpItemRoleId = unassignedJumpItemRoleId;

        return dto;
    }
}
