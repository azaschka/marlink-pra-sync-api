import { JumpClientInstallMode as BTJumpClientInstallMode } from '../../beyondtrust-pra-conf-api/jump-client/enums';
import { JumpClientInstallMode } from '../enums';

export function mapFromBTJumpClientInstallMode(
    btJumpClientInstallMode: BTJumpClientInstallMode,
): JumpClientInstallMode {
    switch (btJumpClientInstallMode) {
        case BTJumpClientInstallMode.Service:
            return JumpClientInstallMode.Service;
        case BTJumpClientInstallMode.Unknown:
            return JumpClientInstallMode.Unknown;
        case BTJumpClientInstallMode.User:
            return JumpClientInstallMode.User;
        default:
            throw new Error(`Unknown BTJumpClientInstallMode: ${btJumpClientInstallMode}`);
    }
}
