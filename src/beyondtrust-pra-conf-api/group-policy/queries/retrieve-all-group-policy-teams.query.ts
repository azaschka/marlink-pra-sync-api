export class RetrieveAllGroupPolicyTeamsQuery {
    public readonly queryType = 'bt-retrieve-all-group-policy-teams';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
