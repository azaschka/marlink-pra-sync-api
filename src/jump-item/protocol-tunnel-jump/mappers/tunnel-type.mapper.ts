import { TunnelType as BTTunnelType } from '../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/enums';
import { TunnelType } from '../enums';

export function mapFromBTTunnelType(btTunnelType: BTTunnelType): TunnelType {
    switch (btTunnelType) {
        case BTTunnelType.K8s:
            return TunnelType.K8s;
        case BTTunnelType.Mssql:
            return TunnelType.Mssql;
        case BTTunnelType.Tcp:
            return TunnelType.Tcp;
        case BTTunnelType.Ip:
            return TunnelType.Ip;
        default:
            throw new Error(`Unknown BTTunnelType: ${btTunnelType}`);
    }
}

export function mapToBTTunnelType(tunnelType: TunnelType): BTTunnelType {
    switch (tunnelType) {
        case TunnelType.K8s:
            return BTTunnelType.K8s;
        case TunnelType.Mssql:
            return BTTunnelType.Mssql;
        case TunnelType.Tcp:
            return BTTunnelType.Tcp;
        case TunnelType.Ip:
            return BTTunnelType.Ip;
        default:
            throw new Error(`Unknown TunnelType: ${tunnelType}`);
    }
}
