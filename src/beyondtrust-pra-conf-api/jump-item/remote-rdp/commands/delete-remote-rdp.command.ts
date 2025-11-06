export class DeleteRemoteRdpCommand {
    public readonly commandType = 'bt-delete-remote-rdp';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
