export class RetrieveGroupPolicyJumpointsQuery {
    public readonly queryType = 'bt-retrieve-group-policy-jumpoints';

    constructor(
        public readonly transactionId: string,
        public readonly pageSize: number,
        public readonly pageNumber: number,
        public readonly id: number,
    ) {}
}
