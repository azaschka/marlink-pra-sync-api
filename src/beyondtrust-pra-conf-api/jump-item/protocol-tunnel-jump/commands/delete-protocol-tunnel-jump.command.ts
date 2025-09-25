export class DeleteProtocolTunnelJumpCommand {
    public readonly commandType = 'bt-delete-protocol-tunnel-jump';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
