export class DeleteTeamCommand {
    public readonly commandType = 'bt-delete-team';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
    ) {}
}
