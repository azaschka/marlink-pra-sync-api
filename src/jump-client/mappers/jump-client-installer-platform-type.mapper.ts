import { JumpClientInstallerPlatformType as BTJumpClientInstallerPlatformType } from '../../beyondtrust-pra-conf-api/jump-client/enums';
import { JumpClientInstallerPlatformType } from '../enums';

export function mapFromBTJumpClientInstallerPlatformType(
    btJumpClientInstallerPlatformType: BTJumpClientInstallerPlatformType,
): JumpClientInstallerPlatformType {
    switch (btJumpClientInstallerPlatformType) {
        case BTJumpClientInstallerPlatformType.Linux32Armv7:
            return JumpClientInstallerPlatformType.Linux32Armv7;
        case BTJumpClientInstallerPlatformType.Linux32Armv7Headless:
            return JumpClientInstallerPlatformType.Linux32Armv7Headless;
        case BTJumpClientInstallerPlatformType.Linux64X86:
            return JumpClientInstallerPlatformType.Linux64X86;
        case BTJumpClientInstallerPlatformType.Linux64X86Headless:
            return JumpClientInstallerPlatformType.Linux64X86Headless;
        case BTJumpClientInstallerPlatformType.Linux64:
            return JumpClientInstallerPlatformType.Linux64;
        case BTJumpClientInstallerPlatformType.Linux64Headless:
            return JumpClientInstallerPlatformType.Linux64Headless;
        case BTJumpClientInstallerPlatformType.RaspberryPi32Headless:
            return JumpClientInstallerPlatformType.RaspberryPi32Headless;
        case BTJumpClientInstallerPlatformType.MacDmg:
            return JumpClientInstallerPlatformType.MacDmg;
        case BTJumpClientInstallerPlatformType.MacZip:
            return JumpClientInstallerPlatformType.MacZip;
        case BTJumpClientInstallerPlatformType.MacOsxX86:
            return JumpClientInstallerPlatformType.MacOsxX86;
        case BTJumpClientInstallerPlatformType.Windows64:
            return JumpClientInstallerPlatformType.Windows64;
        case BTJumpClientInstallerPlatformType.Windows64Msi:
            return JumpClientInstallerPlatformType.Windows64Msi;
        case BTJumpClientInstallerPlatformType.WinNT64Msi:
            return JumpClientInstallerPlatformType.WinNT64Msi;
        case BTJumpClientInstallerPlatformType.Windows32:
            return JumpClientInstallerPlatformType.Windows32;
        case BTJumpClientInstallerPlatformType.Windows32Msi:
            return JumpClientInstallerPlatformType.Windows32Msi;
        case BTJumpClientInstallerPlatformType.WinNT32Msi:
            return JumpClientInstallerPlatformType.WinNT32Msi;
        default:
            throw new Error(`Unknown BTJumpClientInstallerPlatformType: ${btJumpClientInstallerPlatformType}`);
    }
}
