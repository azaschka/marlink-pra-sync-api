export class DeleteTeamCommand {
    public readonly commandType = 'bt-delete-team';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
    ) {}
}
