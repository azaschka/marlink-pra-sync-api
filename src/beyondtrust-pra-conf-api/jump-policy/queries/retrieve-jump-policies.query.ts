export class RetrieveJumpPoliciesQuery {
    public readonly queryType = 'bt-retrieve-jump-policies';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly pageSize: number,
        public readonly pageNumber: number,
        public readonly codeName?: string,
    ) {}
}
