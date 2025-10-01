export class RetrieveTeamsQuery {
    public readonly queryType = 'bt-retrieve-teams';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly pageSize: number,
        public readonly pageNumber: number,
        public readonly name?: string,
        public readonly codeName?: string,
    ) {}
}
