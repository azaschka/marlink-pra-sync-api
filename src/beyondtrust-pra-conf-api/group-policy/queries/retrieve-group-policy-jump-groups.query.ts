export class RetrieveGroupPolicyJumpGroupsQuery {
    public readonly queryType = 'bt-retrieve-group-policy-jump-groups';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly pageSize: number,
        public readonly pageNumber: number,
        public readonly id: number,
    ) {}
}
