export class DeleteRemoteVncCommand {
    public readonly commandType = 'bt-delete-remote-vnc';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
