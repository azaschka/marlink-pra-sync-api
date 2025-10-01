export class RetrieveJumpointInstallerQuery {
    public readonly queryType = 'bt-retrieve-jumpoint-installer';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly jumpointId: number,
    ) {}
}
