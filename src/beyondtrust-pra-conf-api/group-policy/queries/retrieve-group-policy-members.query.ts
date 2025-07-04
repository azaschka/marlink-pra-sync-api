export class RetrieveGroupPolicyMembersQuery {
    public readonly queryType = 'bt-retrieve-group-policy-members';

    constructor(
        public readonly transactionId: string,
        public readonly pageSize: number,
        public readonly pageNumber: number,
        public readonly id: number,
    ) {}
}
