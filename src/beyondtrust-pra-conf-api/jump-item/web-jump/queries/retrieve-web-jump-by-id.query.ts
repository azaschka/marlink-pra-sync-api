export class RetrieveWebJumpByIdQuery {
    public readonly queryType = 'bt-retrieve-web-jump-by-id';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
    ) {}
}
