export class RetrieveAllGroupPolicyJumpointsQuery {
    public readonly queryType = 'bt-retrieve-all-group-policy-jumpoints';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
