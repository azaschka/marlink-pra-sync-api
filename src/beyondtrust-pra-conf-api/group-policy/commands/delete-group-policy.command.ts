export class DeleteGroupPolicyCommand {
    public readonly commandType = 'bt-delete-group-policy';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
    ) {}
}
