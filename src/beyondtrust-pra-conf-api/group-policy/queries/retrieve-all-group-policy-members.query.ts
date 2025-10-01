export class RetrieveAllGroupPolicyMembersQuery {
    public readonly queryType = 'bt-retrieve-all-group-policy-members';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
