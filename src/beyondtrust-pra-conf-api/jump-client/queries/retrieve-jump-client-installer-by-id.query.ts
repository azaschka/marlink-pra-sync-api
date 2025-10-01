export class RetrieveJumpClientInstallerByIdQuery {
    public readonly queryType = 'bt-retrieve-jump-client-installer-by-id';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
