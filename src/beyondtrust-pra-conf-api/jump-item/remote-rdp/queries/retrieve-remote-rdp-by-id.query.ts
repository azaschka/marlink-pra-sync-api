export class RetrieveRemoteRdpByIdQuery {
    public readonly queryType = 'bt-retrieve-remote-rdp-by-id';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
