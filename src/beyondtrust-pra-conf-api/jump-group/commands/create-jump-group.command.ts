export class CreateJumpGroupCommand {
    public readonly commandType = 'bt-create-jump-group';

    constructor(
        public readonly transactionId: string,
        public readonly name: string,
        public readonly codeName?: string,
        public readonly comments?: string | null,
    ) {}
}
