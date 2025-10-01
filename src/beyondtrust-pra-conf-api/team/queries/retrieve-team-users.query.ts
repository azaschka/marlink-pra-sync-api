export class RetrieveTeamUsersQuery {
    public readonly queryType = 'bt-retrieve-team-users';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly pageSize: number,
        public readonly pageNumber: number,
        public readonly id: number,
    ) {}
}
