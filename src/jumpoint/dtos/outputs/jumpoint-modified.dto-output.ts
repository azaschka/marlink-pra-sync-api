import { ApiProperty } from '@nestjs/swagger';
import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../../enums';
import { Jumpoint } from '../../models';

export class JumpointModifiedDtoOutput implements Jumpoint {
    @ApiProperty({ type: Number, required: true })
    public id!: number;

    @ApiProperty({ type: String, required: true })
    public name!: string;

    @ApiProperty({ enum: JumpointPlatformType, required: true })
    public platformType!: JumpointPlatformType;

    @ApiProperty({ type: String, required: false })
    public codeName?: string;

    @ApiProperty({ type: String, required: false })
    public comments?: string;

    @ApiProperty({ type: Boolean, required: false })
    public isEnabled?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    public isConnected?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    public isClustered?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    public isShellJumpEnabled?: boolean;

    @ApiProperty({ type: String, required: false })
    public externalJumpItemNetworkId?: string;

    @ApiProperty({ type: Boolean, required: false })
    public isProtocolTunnelEnabled?: boolean;

    @ApiProperty({ type: Number, required: false, nullable: true })
    public rdpServiceAccountId?: number | null;

    @ApiProperty({ type: [String], required: false })
    public managedIpRanges?: string[];

    @ApiProperty({ type: Boolean, required: false })
    public isJzpEnabled?: boolean;

    @ApiProperty({ type: String, required: false })
    public jzpProxyHostname?: string;

    @ApiProperty({ type: Number, required: false })
    public jzpProxyPort?: number;

    @ApiProperty({ type: Boolean, required: false })
    public isJzpHttpGetAllowed?: boolean;

    @ApiProperty({ enum: JzpClientAddressRestrictionsType, required: false })
    public jzpClientAddressRestrictionsType?: JzpClientAddressRestrictionsType;

    @ApiProperty({ type: [String], required: false })
    public jzpRestrictedIps?: string[];

    @ApiProperty({ type: String, required: false })
    public dockerDeployKey?: string;

    @ApiProperty({ type: String, required: false })
    public keyInfo?: string;

    @ApiProperty({ type: Date, required: true })
    public lastSyncDate!: Date;
}
