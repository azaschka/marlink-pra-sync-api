import { ShellJumpTerminalType as BTShellJumpTerminalType } from '../../../beyondtrust-pra-conf-api/jump-item/shell-jump/enums';
import { ShellJumpTerminalType } from '../enums';

export function mapFromBTShellJumpTerminalType(
    btShellJumpTerminalType: BTShellJumpTerminalType,
): ShellJumpTerminalType {
    switch (btShellJumpTerminalType) {
        case BTShellJumpTerminalType.VT100:
            return ShellJumpTerminalType.VT100;
        case BTShellJumpTerminalType.Xterm:
            return ShellJumpTerminalType.Xterm;
        default:
            throw new Error(`Unknown BTShellJumpTerminalType: ${btShellJumpTerminalType}`);
    }
}

export function mapToBTShellJumpTerminalType(shellJumpTerminalType: ShellJumpTerminalType): BTShellJumpTerminalType {
    switch (shellJumpTerminalType) {
        case ShellJumpTerminalType.VT100:
            return BTShellJumpTerminalType.VT100;
        case ShellJumpTerminalType.Xterm:
            return BTShellJumpTerminalType.Xterm;
        default:
            throw new Error(`Unknown ShellJumpTerminalType: ${shellJumpTerminalType}`);
    }
}
