export class DeleteJumpClientInstallerCommand {
    public readonly commandType = 'bt-delete-jump-client-installer';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
    ) {}
}
