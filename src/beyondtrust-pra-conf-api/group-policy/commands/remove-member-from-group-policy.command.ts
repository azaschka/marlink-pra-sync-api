export class RemoveMemberFromGroupPolicyCommand {
    public readonly commandType = 'bt-remove-member-from-group-policy';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
        public readonly memberId: number,
    ) {}
}
