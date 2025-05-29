import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../enums';

export class ModifyJumpointCommand {
    public readonly commandType = 'bt-modify-jumpoint';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
        public readonly name: string,
        public readonly platform: JumpointPlatformType,
        public readonly codeName?: string,
        public readonly comments?: string,
        public readonly enabled?: boolean,
        public readonly clustered?: boolean,
        public readonly shellJumpEnabled?: boolean,
        public readonly externalJumpItemNetworkId?: string,
        public readonly protocolTunnelEnabled?: boolean,
        public readonly rdpServiceAccountId?: number | null,
        public readonly managedIpRanges?: string[],
        public readonly jzpEnabled?: boolean,
        public readonly jzpProxyHostname?: string,
        public readonly jzpProxyPort?: number,
        public readonly jzpAllowHttpGet?: boolean,
        public readonly jzpClientAddressRestrictionsType?: JzpClientAddressRestrictionsType,
        public readonly jzpRestrictedIps?: string[],
    ) {}
}
