export class RetrieveRemoteVncByIdQuery {
    public readonly queryType = 'bt-retrieve-remote-vnc-by-id';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
    ) {}
}
