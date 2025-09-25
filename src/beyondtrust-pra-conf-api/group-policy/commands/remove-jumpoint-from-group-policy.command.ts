export class RemoveJumpointFromGroupPolicyCommand {
    public readonly commandType = 'bt-remove-jumpoint-from-group-policy';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
        public readonly jumpointId: number,
    ) {}
}
