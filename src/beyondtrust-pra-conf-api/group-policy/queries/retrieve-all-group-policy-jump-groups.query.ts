export class RetrieveAllGroupPolicyJumpGroupsQuery {
    public readonly queryType = 'bt-retrieve-all-group-policy-jump-groups';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
