export class DeleteRemoteRdpCommand {
    public readonly commandType = 'bt-delete-remote-rdp';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
    ) {}
}
