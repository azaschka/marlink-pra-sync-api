import { Expose } from 'class-transformer';
import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../../enums';
import { JumpointIpRange } from '../../models';

export class JumpointRetrievedDtoOutput {
    public id!: number;

    @Expose({ name: 'name' })
    public name!: string;

    @Expose({ name: 'platform' })
    public platform!: JumpointPlatformType;

    @Expose({ name: 'code_name' })
    public codeName?: string;

    @Expose({ name: 'comments' })
    public comments?: string;

    @Expose({ name: 'enabled' })
    public enabled?: boolean;

    @Expose({ name: 'connected' })
    public connected?: boolean;

    @Expose({ name: 'clustered' })
    public clustered?: boolean;

    @Expose({ name: 'shell_jump_enabled' })
    public shellJumpEnabled?: boolean;

    @Expose({ name: 'external_jump_item_network_id' })
    public externalJumpItemNetworkId?: string;

    @Expose({ name: 'protocol_tunnel_enabled' })
    public protocolTunnelEnabled?: boolean;

    @Expose({ name: 'rdp_service_account_id' })
    public rdpServiceAccountId?: number | null;

    @Expose({ name: 'managed_ip_ranges' })
    public managedIpRanges?: JumpointIpRange[];

    @Expose({ name: 'jzp_enabled' })
    public jzpEnabled?: boolean;

    @Expose({ name: 'jzp_proxy_hostname' })
    public jzpProxyHostname?: string;

    @Expose({ name: 'jzp_proxy_port' })
    public jzpProxyPort?: number;

    @Expose({ name: 'jzp_allow_http_get' })
    public jzpAllowHttpGet?: boolean;

    @Expose({ name: 'jzp_client_address_restrictions_type' })
    public jzpClientAddressRestrictionsType?: JzpClientAddressRestrictionsType;

    @Expose({ name: 'jzp_restricted_ips' })
    public jzpRestrictedIps?: string[];

    @Expose({ name: 'docker_deploy_key' })
    public dockerDeployKey?: string;

    @Expose({ name: 'key_info' })
    public keyInfo?: string;
}
