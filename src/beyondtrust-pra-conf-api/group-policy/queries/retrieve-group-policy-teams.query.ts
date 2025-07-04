export class RetrieveGroupPolicyTeamsQuery {
    public readonly queryType = 'bt-retrieve-group-policy-teams';

    constructor(
        public readonly transactionId: string,
        public readonly pageSize: number,
        public readonly pageNumber: number,
        public readonly id: number,
    ) {}
}
