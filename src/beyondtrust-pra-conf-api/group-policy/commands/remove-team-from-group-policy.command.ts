export class RemoveTeamFromGroupPolicyCommand {
    public readonly commandType = 'bt-remove-team-from-group-policy';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
        public readonly teamId: number,
    ) {}
}
