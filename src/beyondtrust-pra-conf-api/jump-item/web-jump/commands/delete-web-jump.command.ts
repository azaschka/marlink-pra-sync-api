export class DeleteWebJumpCommand {
    public readonly commandType = 'bt-delete-web-jump';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
