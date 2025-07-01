export class RetrieveJumpClientByIdQuery {
    public readonly queryType = 'bt-retrieve-jump-client-by-id';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
    ) {}
}
