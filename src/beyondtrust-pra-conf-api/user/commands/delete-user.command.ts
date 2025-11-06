export class DeleteUserCommand {
    public readonly commandType = 'bt-delete-user';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
