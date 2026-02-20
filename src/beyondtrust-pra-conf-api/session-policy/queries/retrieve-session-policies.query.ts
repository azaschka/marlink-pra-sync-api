export class RetrieveSessionPoliciesQuery {
    public readonly queryType = 'bt-retrieve-session-policies';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly pageSize: number,
        public readonly pageNumber: number,
    ) {}
}
