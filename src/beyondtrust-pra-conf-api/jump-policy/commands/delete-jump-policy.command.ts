export class DeleteJumpPolicyCommand {
    public readonly commandType = 'bt-delete-jump-policy';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
