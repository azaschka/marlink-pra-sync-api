export class RetrieveUsersQuery {
    public readonly queryType = 'bt-retrieve-users';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly pageSize: number,
        public readonly pageNumber: number,
        public readonly securityProviderId?: number,
        public readonly username?: string,
        public readonly email?: string,
    ) {}
}
