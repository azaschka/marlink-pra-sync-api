import { SimultaneousJumpsType as BTSimultaneousJumpsType } from '../../beyondtrust-pra-conf-api/jump-policy/enums';
import { SimultaneousJumpsType } from '../enums';

export function mapFromBTSimultaneousJumpsType(
    btSimultaneousJumpsType: BTSimultaneousJumpsType,
): SimultaneousJumpsType {
    switch (btSimultaneousJumpsType) {
        case BTSimultaneousJumpsType.Global:
            return SimultaneousJumpsType.Global;
        case BTSimultaneousJumpsType.Join:
            return SimultaneousJumpsType.Join;
        case BTSimultaneousJumpsType.Disallow:
            return SimultaneousJumpsType.Disallow;
        default:
            throw new Error(`Unknown BTSimultaneousJumpsType: ${btSimultaneousJumpsType}`);
    }
}

export function mapToBTSimultaneousJumpsType(simultaneousJumpsType: SimultaneousJumpsType): BTSimultaneousJumpsType {
    switch (simultaneousJumpsType) {
        case SimultaneousJumpsType.Global:
            return BTSimultaneousJumpsType.Global;
        case SimultaneousJumpsType.Join:
            return BTSimultaneousJumpsType.Join;
        case SimultaneousJumpsType.Disallow:
            return BTSimultaneousJumpsType.Disallow;
        default:
            throw new Error(`Unknown SimultaneousJumpsType: ${simultaneousJumpsType}`);
    }
}
