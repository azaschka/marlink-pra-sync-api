export class RemoveJumpGroupFromGroupPolicyCommand {
    public readonly commandType = 'bt-remove-jump-group-from-group-policy';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
        public readonly jumpGroupId: number,
    ) {}
}
