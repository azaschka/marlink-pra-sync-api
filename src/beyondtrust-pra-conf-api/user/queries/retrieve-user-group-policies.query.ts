export class RetrieveUserGroupPoliciesQuery {
    public readonly queryType = 'bt-retrieve-user-group-policies';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
