import { JzpClientAddressRestrictionsType as BTJzpClientAddressRestrictionsType } from '../../beyondtrust-pra-conf-api/jumpoint/enums';
import { JzpClientAddressRestrictionsType } from '../enums';

export function mapFromBTJzpClientAddressRestrictionsType(
    btJzpClientAddressRestrictionsType: BTJzpClientAddressRestrictionsType,
): JzpClientAddressRestrictionsType {
    switch (btJzpClientAddressRestrictionsType) {
        case BTJzpClientAddressRestrictionsType.AllowAll:
            return JzpClientAddressRestrictionsType.AllowAll;
        case BTJzpClientAddressRestrictionsType.DenyAll:
            return JzpClientAddressRestrictionsType.DenyAll;
        case BTJzpClientAddressRestrictionsType.NoRestriction:
            return JzpClientAddressRestrictionsType.NoRestriction;
        default:
            throw new Error(`Unknown BTJzpClientAddressRestrictionsType: ${btJzpClientAddressRestrictionsType}`);
    }
}

export function mapToBTJzpClientAddressRestrictionsType(
    jzpClientAddressRestrictionsType: JzpClientAddressRestrictionsType,
): BTJzpClientAddressRestrictionsType {
    switch (jzpClientAddressRestrictionsType) {
        case JzpClientAddressRestrictionsType.AllowAll:
            return BTJzpClientAddressRestrictionsType.AllowAll;
        case JzpClientAddressRestrictionsType.DenyAll:
            return BTJzpClientAddressRestrictionsType.DenyAll;
        case JzpClientAddressRestrictionsType.NoRestriction:
            return BTJzpClientAddressRestrictionsType.NoRestriction;
        default:
            throw new Error(`Unknown JzpClientAddressRestrictionsType: ${jzpClientAddressRestrictionsType}`);
    }
}
