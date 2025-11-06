import { UserTeamRoleType } from '../enums';

export class AddUserToTeamCommand {
    public readonly commandType = 'bt-add-user-to-team';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly id: number,
        public readonly userId: number,
        public readonly role?: UserTeamRoleType,
    ) {}
}
