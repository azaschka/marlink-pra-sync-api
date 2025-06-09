export class RetrieveShellJumpByIdQuery {
    public readonly queryType = 'bt-retrieve-shell-jump-by-id';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
    ) {}
}
