export class DeleteGroupPolicyCommand {
    public readonly commandType = 'bt-delete-group-policy';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
