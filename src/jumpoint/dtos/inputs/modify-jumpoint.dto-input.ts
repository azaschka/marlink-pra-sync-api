import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../../enums';

export class ModifyJumpointDtoInput {
    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    public name?: string;

    @ApiProperty({ enum: JumpointPlatformType, required: false })
    @IsOptional()
    @IsEnum(JumpointPlatformType)
    public platformType?: JumpointPlatformType;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    public codeName?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    public comments?: string;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    public isEnabled?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    public isClustered?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    public isShellJumpEnabled?: boolean;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    public externalJumpItemNetworkId?: string;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    public isProtocolTunnelEnabled?: boolean;

    @ApiProperty({ type: Number, required: false, nullable: true })
    @IsOptional()
    @IsInt()
    public rdpServiceAccountId?: number | null;

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    public managedIpRanges?: string[];

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    public isJzpEnabled?: boolean;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    public jzpProxyHostname?: string;

    @ApiProperty({ type: Number, required: false })
    @IsOptional()
    @IsInt()
    public jzpProxyPort?: number;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    public isJzpHttpGetAllowed?: boolean;

    @ApiProperty({ enum: JzpClientAddressRestrictionsType, required: false })
    @IsOptional()
    @IsEnum(JzpClientAddressRestrictionsType)
    public jzpClientAddressRestrictionsType?: JzpClientAddressRestrictionsType;

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    public jzpRestrictedIps?: string[];
}
