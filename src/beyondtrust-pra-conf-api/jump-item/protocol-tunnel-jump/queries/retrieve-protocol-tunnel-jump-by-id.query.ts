export class RetrieveProtocolTunnelJumpByIdQuery {
    public readonly queryType = 'bt-retrieve-protocol-tunnel-jump-by-id';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
    ) {}
}
