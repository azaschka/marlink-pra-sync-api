import { Expose } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../../enums';
import { JumpointIpRange } from '../../models';

export class ModifyJumpointDtoInput {
    @Expose({ name: 'name' })
    @IsString()
    @IsOptional()
    public name?: string;

    @Expose({ name: 'platform' })
    @IsEnum(JumpointPlatformType)
    @IsOptional()
    public platform?: JumpointPlatformType;

    @Expose({ name: 'code_name' })
    @IsString()
    @IsOptional()
    public codeName?: string;

    @Expose({ name: 'comments' })
    @IsString()
    @IsOptional()
    public comments?: string;

    @Expose({ name: 'enabled' })
    @IsBoolean()
    @IsOptional()
    public enabled?: boolean;

    @Expose({ name: 'clustered' })
    @IsBoolean()
    @IsOptional()
    public clustered?: boolean;

    @Expose({ name: 'shell_jump_enabled' })
    @IsBoolean()
    @IsOptional()
    public shellJumpEnabled?: boolean;

    @Expose({ name: 'external_jump_item_network_id' })
    @IsString()
    @IsOptional()
    public externalJumpItemNetworkId?: string;

    @Expose({ name: 'protocol_tunnel_enabled' })
    @IsBoolean()
    @IsOptional()
    public protocolTunnelEnabled?: boolean;

    @Expose({ name: 'rdp_service_account_id' })
    @IsInt()
    @IsOptional()
    public rdpServiceAccountId?: number | null;

    @Expose({ name: 'managed_ip_ranges' })
    @IsArray({ each: true })
    @IsOptional()
    public managedIpRanges?: JumpointIpRange[];

    @Expose({ name: 'jzp_enabled' })
    @IsBoolean()
    @IsOptional()
    public jzpEnabled?: boolean;

    @Expose({ name: 'jzp_proxy_hostname' })
    @IsString()
    @IsOptional()
    public jzpProxyHostname?: string;

    @Expose({ name: 'jzp_proxy_port' })
    @IsInt()
    @IsOptional()
    public jzpProxyPort?: number;

    @Expose({ name: 'jzp_allow_http_get' })
    @IsBoolean()
    @IsOptional()
    public jzpAllowHttpGet?: boolean;

    @Expose({ name: 'jzp_client_address_restrictions_type' })
    @IsOptional()
    @IsEnum(JzpClientAddressRestrictionsType)
    public jzpClientAddressRestrictionsType?: JzpClientAddressRestrictionsType;

    @Expose({ name: 'jzp_restricted_ips' })
    @IsString({ each: true })
    @IsOptional()
    public jzpRestrictedIps?: string[];

    public static create(
        name?: string,
        platform?: JumpointPlatformType,
        codeName?: string,
        comments?: string,
        enabled?: boolean,
        clustered?: boolean,
        shellJumpEnabled?: boolean,
        externalJumpItemNetworkId?: string,
        protocolTunnelEnabled?: boolean,
        rdpServiceAccountId?: number | null,
        managedIpRanges?: JumpointIpRange[],
        jzpEnabled?: boolean,
        jzpProxyHostname?: string,
        jzpProxyPort?: number,
        jzpAllowHttpGet?: boolean,
        jzpClientAddressRestrictionsType?: JzpClientAddressRestrictionsType,
        jzpRestrictedIps?: string[],
    ) {
        const dto = new ModifyJumpointDtoInput();
        dto.name = name;
        dto.platform = platform;
        dto.codeName = codeName;
        dto.comments = comments;
        dto.enabled = enabled;
        dto.clustered = clustered;
        dto.shellJumpEnabled = shellJumpEnabled;
        dto.externalJumpItemNetworkId = externalJumpItemNetworkId;
        dto.protocolTunnelEnabled = protocolTunnelEnabled;
        dto.rdpServiceAccountId = rdpServiceAccountId;
        dto.managedIpRanges = managedIpRanges;
        dto.jzpEnabled = jzpEnabled;
        dto.jzpProxyHostname = jzpProxyHostname;
        dto.jzpProxyPort = jzpProxyPort;
        dto.jzpAllowHttpGet = jzpAllowHttpGet;
        dto.jzpClientAddressRestrictionsType = jzpClientAddressRestrictionsType;
        dto.jzpRestrictedIps = jzpRestrictedIps;

        return dto;
    }
}
