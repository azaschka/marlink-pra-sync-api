export class CreateBackupCommand {
    public readonly commandType = 'bt-create-backup';

    constructor(
        public readonly transactionId: string,
        public readonly password?: string,
    ) {}
}
