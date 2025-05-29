import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../enums';

export interface Jumpoint {
    id: number;
    name: string;
    platformType: JumpointPlatformType;
    codeName?: string;
    comments?: string;
    isEnabled?: boolean;
    isConnected?: boolean;
    isClustered?: boolean;
    isShellJumpEnabled?: boolean;
    externalJumpItemNetworkId?: string;
    isProtocolTunnelEnabled?: boolean;
    rdpServiceAccountId?: number | null;
    managedIpRanges?: string[];
    isJzpEnabled?: boolean;
    jzpProxyHostname?: string;
    jzpProxyPort?: number;
    isJzpHttpGetAllowed?: boolean;
    jzpClientAddressRestrictionsType?: JzpClientAddressRestrictionsType;
    jzpRestrictedIps?: string[];
    dockerDeployKey?: string;
    keyInfo?: string;
    lastSyncDate: Date;
}
