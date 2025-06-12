export class RetrieveAllTeamUsersQuery {
    public readonly queryType = 'bt-retrieve-all-team-users';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
    ) {}
}
