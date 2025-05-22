import { SimultaneousJumpsRdpType as BTSimultaneousJumpsRdpType } from '../../beyondtrust-pra-conf-api/jump-policy/enums';
import { SimultaneousJumpsRdpType } from '../enums';

export function mapFromBTSimultaneousJumpsRdpType(
    btSimultaneousJumpsRdpType: BTSimultaneousJumpsRdpType,
): SimultaneousJumpsRdpType {
    switch (btSimultaneousJumpsRdpType) {
        case BTSimultaneousJumpsRdpType.Global:
            return SimultaneousJumpsRdpType.Global;
        case BTSimultaneousJumpsRdpType.NewSession:
            return SimultaneousJumpsRdpType.NewSession;
        case BTSimultaneousJumpsRdpType.Disallow:
            return SimultaneousJumpsRdpType.Disallow;
        default:
            throw new Error(`Unknown BTSimultaneousJumpsRdpType: ${btSimultaneousJumpsRdpType}`);
    }
}

export function mapToBTSimultaneousJumpsRdpType(
    simultaneousJumpsRdpType: SimultaneousJumpsRdpType,
): BTSimultaneousJumpsRdpType {
    switch (simultaneousJumpsRdpType) {
        case SimultaneousJumpsRdpType.Global:
            return BTSimultaneousJumpsRdpType.Global;
        case SimultaneousJumpsRdpType.NewSession:
            return BTSimultaneousJumpsRdpType.NewSession;
        case SimultaneousJumpsRdpType.Disallow:
            return BTSimultaneousJumpsRdpType.Disallow;
        default:
            throw new Error(`Unknown SimultaneousJumpsRdpType: ${simultaneousJumpsRdpType}`);
    }
}
