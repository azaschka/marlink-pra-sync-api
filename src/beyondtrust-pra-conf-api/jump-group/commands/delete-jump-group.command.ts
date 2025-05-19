export class DeleteJumpGroupCommand {
    public readonly commandType = 'bt-delete-jump-group';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
    ) {}
}
