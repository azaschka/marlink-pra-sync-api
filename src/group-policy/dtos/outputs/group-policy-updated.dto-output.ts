import { ApiProperty } from '@nestjs/swagger';
import { AccessPermissionStatusType } from '../../enums';
import { GroupPolicy } from '../../models';

export class GroupPolicyUpdatedDtoOutput implements GroupPolicy {
    @ApiProperty({ required: true, type: Number })
    public id!: number;

    @ApiProperty({ required: true, type: String })
    public name!: string;

    @ApiProperty({ required: true, type: Number })
    public btId!: number;

    @ApiProperty({ required: false, type: Boolean })
    public hasEndpointsAccessPermission?: boolean;

    @ApiProperty({ required: false, enum: AccessPermissionStatusType })
    public accessPermissionStatusType?: AccessPermissionStatusType;

    @ApiProperty({ required: false, type: Boolean })
    public hasShareOtherTeamPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasInviteExternalUserPermission?: boolean;

    @ApiProperty({ required: false, type: Number })
    public userSessionIdleTimeoutInSeconds?: number;

    @ApiProperty({ required: false, type: Boolean })
    public hasEnableExtendedAvailabilityModePermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasEditExternalKeyPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasCollaboratePermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasCollaborateControlPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasJumpClientPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasLocalJumpPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasRemoteJumpPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasRemoteVncPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasRemoteRdpPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasShellJumpPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasWebJumpPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasProtocolTunnelPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    public hasSdStaticPortForExternalToolsPermission?: boolean;

    @ApiProperty({ required: false, type: Number })
    public defaultJumpItemRoleId?: number;

    @ApiProperty({ required: false, type: Number })
    public privateJumpItemRoleId?: number;

    @ApiProperty({ required: false, type: Number })
    public inferiorJumpItemRoleId?: number;

    @ApiProperty({ required: false, type: Number })
    public unassignedJumpItemRoleId?: number;
}
