import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { AccessPermissionStatusType } from '../../enums';

export class ModifyGroupPolicyDtoInput {
    @ApiProperty({ required: false, type: String })
    @IsOptional()
    @IsString()
    public name?: string;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasEndpointsAccessPermission?: boolean;

    @ApiProperty({ required: false, enum: AccessPermissionStatusType })
    @IsOptional()
    @IsEnum(AccessPermissionStatusType)
    public accessPermissionStatusType?: AccessPermissionStatusType;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasShareOtherTeamPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasInviteExternalUserPermission?: boolean;

    @ApiProperty({ required: false, type: Number })
    @IsOptional()
    @IsNumber()
    public userSessionIdleTimeoutInSeconds?: number;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasEnableExtendedAvailabilityModePermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasEditExternalKeyPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasCollaboratePermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasCollaborateControlPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasJumpClientPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasLocalJumpPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasRemoteJumpPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasRemoteVncPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasRemoteRdpPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasShellJumpPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasWebJumpPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasProtocolTunnelPermission?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public hasSdStaticPortForExternalToolsPermission?: boolean;

    @ApiProperty({ required: false, type: Number })
    @IsOptional()
    @IsNumber()
    public defaultJumpItemRoleId?: number;

    @ApiProperty({ required: false, type: Number })
    @IsOptional()
    @IsNumber()
    public privateJumpItemRoleId?: number;

    @ApiProperty({ required: false, type: Number })
    @IsOptional()
    @IsNumber()
    public inferiorJumpItemRoleId?: number;

    @ApiProperty({ required: false, type: Number })
    @IsOptional()
    @IsNumber()
    public unassignedJumpItemRoleId?: number;
}
