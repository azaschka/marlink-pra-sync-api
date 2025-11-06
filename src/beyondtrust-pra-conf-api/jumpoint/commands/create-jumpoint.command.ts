import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../enums';
import { JumpointIpRange } from '../models';

export class CreateJumpointCommand {
    public readonly commandType = 'bt-create-jumpoint';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
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
        public readonly managedIpRanges?: JumpointIpRange[],
        public readonly jzpEnabled?: boolean,
        public readonly jzpProxyHostname?: string,
        public readonly jzpProxyPort?: number,
        public readonly jzpAllowHttpGet?: boolean,
        public readonly jzpClientAddressRestrictionsType?: JzpClientAddressRestrictionsType,
        public readonly jzpRestrictedIps?: string[],
    ) {}
}
