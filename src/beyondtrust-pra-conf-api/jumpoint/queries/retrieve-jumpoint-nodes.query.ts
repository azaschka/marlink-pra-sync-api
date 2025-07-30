export class RetrieveJumpointNodesQuery {
    public readonly queryType = 'bt-retrieve-jumpoint-nodes';

    constructor(
        public readonly transactionId: string,
        public readonly jumpointId: number,
    ) {}
}
