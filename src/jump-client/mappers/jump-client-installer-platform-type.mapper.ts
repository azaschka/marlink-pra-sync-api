import { JumpClientInstallerPlatformType as BTJumpClientInstallerPlatformType } from '../../beyondtrust-pra-conf-api/jump-client/enums';
import { JumpClientInstallerPlatformType } from '../enums';

export function mapFromBTJumpClientInstallerPlatformType(
    btJumpClientInstallerPlatformType: BTJumpClientInstallerPlatformType,
): JumpClientInstallerPlatformType {
    switch (btJumpClientInstallerPlatformType) {
        case BTJumpClientInstallerPlatformType.Linux64:
            return JumpClientInstallerPlatformType.Linux64;
        case BTJumpClientInstallerPlatformType.Linux64Headless:
            return JumpClientInstallerPlatformType.Linux64Headless;
        case BTJumpClientInstallerPlatformType.MacDmg:
            return JumpClientInstallerPlatformType.MacDmg;
        case BTJumpClientInstallerPlatformType.MacZip:
            return JumpClientInstallerPlatformType.MacZip;
        case BTJumpClientInstallerPlatformType.Windows64:
            return JumpClientInstallerPlatformType.Windows64;
        case BTJumpClientInstallerPlatformType.Windows64Msi:
            return JumpClientInstallerPlatformType.Windows64Msi;
        case BTJumpClientInstallerPlatformType.RaspberryPi32Headless:
            return JumpClientInstallerPlatformType.RaspberryPi32Headless;
        case BTJumpClientInstallerPlatformType.Windows32:
            return JumpClientInstallerPlatformType.Windows32;
        case BTJumpClientInstallerPlatformType.Windows32Msi:
            return JumpClientInstallerPlatformType.Windows32Msi;
        default:
            throw new Error(`Unknown BTJumpClientInstallerPlatformType: ${btJumpClientInstallerPlatformType}`);
    }
}
