import { JumpGroupType } from '../enums';

export class CopyProtocolTunnelJumpCommand {
    public readonly commandType = 'bt-copy-protocol-tunnel-jump';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
        public readonly jumpGroupId: number,
        public readonly jumpGroupType: JumpGroupType,
        public readonly name: string,
    ) {}
}
