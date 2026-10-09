export class CreateBackupCommand {
    public readonly commandType = 'bt-create-backup';

    /** @param targetFilePath absolute path the backup is streamed to; it only exists after a complete download. */
    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly password?: string,
        public readonly targetFilePath: string = '',
    ) {}
}
