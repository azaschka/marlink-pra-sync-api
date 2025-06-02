export class ModifyUserGroupPoliciesCommand {
    public readonly commandType = 'bt-modify-user-group-policies';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
        public readonly groupPolicyIdsToAdd: number[],
        public readonly groupPolicyIdsToRemove: number[],
    ) {}
}
