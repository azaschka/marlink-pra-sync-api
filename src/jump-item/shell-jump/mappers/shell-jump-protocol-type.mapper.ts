import { ShellJumpProtocolType as BTShellJumpProtocolType } from '../../../beyondtrust-pra-conf-api/jump-item/shell-jump/enums';
import { ShellJumpProtocolType } from '../enums';

export function mapFromBTShellJumpProtocolType(
    btShellJumpProtocolType: BTShellJumpProtocolType,
): ShellJumpProtocolType {
    switch (btShellJumpProtocolType) {
        case BTShellJumpProtocolType.SSH:
            return ShellJumpProtocolType.SSH;
        case BTShellJumpProtocolType.TELNET:
            return ShellJumpProtocolType.TELNET;
        default:
            throw new Error(`Unknown BTShellJumpProtocolType: ${btShellJumpProtocolType}`);
    }
}

export function mapToBTShellJumpProtocolType(shellJumpProtocolType: ShellJumpProtocolType): BTShellJumpProtocolType {
    switch (shellJumpProtocolType) {
        case ShellJumpProtocolType.SSH:
            return BTShellJumpProtocolType.SSH;
        case ShellJumpProtocolType.TELNET:
            return BTShellJumpProtocolType.TELNET;
        default:
            throw new Error(`Unknown ShellJumpProtocolType: ${shellJumpProtocolType}`);
    }
}
