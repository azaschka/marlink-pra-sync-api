import { JumpointPlatformType as BTJumpointPlatformType } from '../../beyondtrust-pra-conf-api/jumpoint/enums';
import { JumpointPlatformType } from '../enums';

export function mapFromBTJumpointPlatformType(btJumpointPlatformType: BTJumpointPlatformType): JumpointPlatformType {
    switch (btJumpointPlatformType) {
        case BTJumpointPlatformType.LinuxX86:
            return JumpointPlatformType.LinuxX86;
        case BTJumpointPlatformType.WindowsX86:
            return JumpointPlatformType.WindowsX86;
        default:
            throw new Error(`Unknown BTJumpointPlatformType: ${btJumpointPlatformType}`);
    }
}

export function mapToBTJumpointPlatformType(jumpointPlatformType: JumpointPlatformType): BTJumpointPlatformType {
    switch (jumpointPlatformType) {
        case JumpointPlatformType.LinuxX86:
            return BTJumpointPlatformType.LinuxX86;
        case JumpointPlatformType.WindowsX86:
            return BTJumpointPlatformType.WindowsX86;
        default:
            throw new Error(`Unknown JumpointPlatformType: ${jumpointPlatformType}`);
    }
}
