export class RetrieveShellJumpByIdQuery {
    public readonly queryType = 'bt-retrieve-shell-jump-by-id';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
