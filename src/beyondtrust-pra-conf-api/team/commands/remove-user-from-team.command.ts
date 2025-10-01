export class RemoveUserFromTeamCommand {
    public readonly commandType = 'bt-remove-user-from-team';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
        public readonly userId: number,
    ) {}
}
