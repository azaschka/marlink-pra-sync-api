export class DeleteJumpointCommand {
    public readonly commandType = 'bt-delete-jumpoint';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
