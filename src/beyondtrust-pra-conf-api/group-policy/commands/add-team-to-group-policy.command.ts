import { GroupPolicyTeamRoleType } from '../enums';

export class AddTeamToGroupPolicyCommand {
    public readonly commandType = 'bt-add-team-to-group-policy';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
        public readonly teamId: number,
        public readonly role?: GroupPolicyTeamRoleType,
    ) {}
}
