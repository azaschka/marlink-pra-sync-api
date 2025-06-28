export class DeleteJumpClientCommand {
    public readonly commandType = 'bt-delete-jump-client';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
    ) {}
}
