export class AddJumpointToGroupPolicyCommand {
    public readonly commandType = 'bt-add-jumpoint-to-group-policy';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
        public readonly jumpointId: number,
    ) {}
}
