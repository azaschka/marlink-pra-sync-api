import { JumpGroupType, ShellJumpProtocolType, ShellJumpTerminalType } from '../enums';

export class ModifyShellJumpCommand {
    public readonly commandType = 'bt-modify-shell-jump';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
        public readonly name: string,
        public readonly jumpointId: number,
        public readonly hostname: string,
        public readonly protocol: ShellJumpProtocolType,
        public readonly port: number | undefined,
        public readonly jumpGroupId: number,
        public readonly jumpGroupType?: JumpGroupType,
        public readonly terminal?: ShellJumpTerminalType,
        public readonly keepAlive?: number,
        public readonly tag?: string,
        public readonly comments?: string,
        public readonly jumpPolicyId?: number | null,
        public readonly username?: string,
        public readonly sessionPolicyId?: number | null,
    ) {}
}
