export class RetrieveJumpClientByIdQuery {
    public readonly queryType = 'bt-retrieve-jump-client-by-id';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
