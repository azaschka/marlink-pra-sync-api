import { JumpClientConnectionType as BTJumpClientConnectionType } from '../../beyondtrust-pra-conf-api/jump-client/enums';
import { JumpClientConnectionType } from '../enums';

export function mapFromBTJumpClientConnectionType(
    btJumpClientConnectionType: BTJumpClientConnectionType,
): JumpClientConnectionType {
    switch (btJumpClientConnectionType) {
        case BTJumpClientConnectionType.Active:
            return JumpClientConnectionType.Active;
        case BTJumpClientConnectionType.Passive:
            return JumpClientConnectionType.Passive;
        case BTJumpClientConnectionType.Uninstalled:
            return JumpClientConnectionType.Uninstalled;
        default:
            throw new Error(`Unknown BTJumpClientConnectionType: ${btJumpClientConnectionType}`);
    }
}

export function mapToBTJumpClientConnectionType(
    jumpClientConnectionType: JumpClientConnectionType,
): BTJumpClientConnectionType {
    switch (jumpClientConnectionType) {
        case JumpClientConnectionType.Active:
            return BTJumpClientConnectionType.Active;
        case JumpClientConnectionType.Passive:
            return BTJumpClientConnectionType.Passive;
        case JumpClientConnectionType.Uninstalled:
            return BTJumpClientConnectionType.Uninstalled;
        default:
            throw new Error(`Unknown JumpClientConnectionType: ${jumpClientConnectionType}`);
    }
}
