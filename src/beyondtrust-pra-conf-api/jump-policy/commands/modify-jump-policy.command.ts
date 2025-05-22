import {
    ApprovalApproverScopeType,
    ApprovalScopeType,
    SimultaneousJumpsRdpType,
    SimultaneousJumpsType,
} from '../enums';

export class ModifyJumpPolicyCommand {
    public readonly commandType = 'bt-modify-jump-policy';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
        public readonly displayName: string,
        public readonly codeName?: string,
        public readonly description?: string,
        public readonly scheduleEnabled?: boolean,
        public readonly simultaneousJumps?: SimultaneousJumpsType,
        public readonly simultaneousJumpBehaviorAppliesToCopies?: boolean,
        public readonly simultaneousJumpsRdp?: SimultaneousJumpsRdpType,
        public readonly scheduleStrict?: boolean,
        public readonly ticketIdRequired?: boolean,
        public readonly twoFactorChallengeRequired?: boolean,
        public readonly sessionStartNotification?: boolean,
        public readonly sessionEndNotification?: boolean,
        public readonly notificationEmailAddresses?: string[],
        public readonly notificationDisplayName?: string,
        public readonly notificationEmailLanguage?: string,
        public readonly approvalRequired?: boolean,
        public readonly approvalMaxDuration?: number,
        public readonly approvalScope?: ApprovalScopeType,
        public readonly approvalEmailAddresses?: string[],
        public readonly approvalUserIds?: string[],
        public readonly approvalTeamIds?: string[],
        public readonly approvalDisplayName?: string,
        public readonly approvalEmailLanguage?: string,
        public readonly approvalApproverScope?: ApprovalApproverScopeType,
        public readonly recordingsDisabled?: boolean,
    ) {}
}
