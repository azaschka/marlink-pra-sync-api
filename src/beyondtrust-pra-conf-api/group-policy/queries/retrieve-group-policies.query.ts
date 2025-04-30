export class RetrieveGroupPoliciesQuery {
    public readonly queryType = 'bt-retrieve-group-policies';

    constructor(
        public readonly transactionId: string,
        public readonly pageSize: number,
        public readonly pageNumber: number,
        public readonly name?: string,
    ) {}
}
