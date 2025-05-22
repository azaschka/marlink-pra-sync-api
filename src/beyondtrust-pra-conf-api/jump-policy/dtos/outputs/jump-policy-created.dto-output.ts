import { Expose } from 'class-transformer';
import {
    ApprovalApproverScopeType,
    ApprovalScopeType,
    SimultaneousJumpsRdpType,
    SimultaneousJumpsType,
} from '../../enums';

export class JumpPolicyCreatedDtoOutput {
    public id!: number;

    @Expose({ name: 'display_name' })
    public displayName!: string;

    @Expose({ name: 'code_name' })
    public codeName?: string;

    @Expose({ name: 'description' })
    public description?: string;

    @Expose({ name: 'schedule_enabled' })
    public scheduleEnabled?: boolean;

    @Expose({ name: 'simultaneous_jumps' })
    public simultaneousJumps?: SimultaneousJumpsType;

    @Expose({ name: 'simultaneous_jump_behavior_applies_to_copies' })
    public simultaneousJumpBehaviorAppliesToCopies?: boolean;

    @Expose({ name: 'simultaneous_jumps_rdp' })
    public simultaneousJumpsRdp?: SimultaneousJumpsRdpType;

    @Expose({ name: 'schedule_strict' })
    public scheduleStrict?: boolean;

    @Expose({ name: 'ticket_id_required' })
    public ticketIdRequired?: boolean;

    @Expose({ name: 'two_factor_challenge_required' })
    public twoFactorChallengeRequired?: boolean;

    @Expose({ name: 'session_start_notification' })
    public sessionStartNotification?: boolean;

    @Expose({ name: 'session_end_notification' })
    public sessionEndNotification?: boolean;

    @Expose({ name: 'notification_email_addresses' })
    public notificationEmailAddresses?: string[];

    @Expose({ name: 'notification_display_name' })
    public notificationDisplayName?: string;

    @Expose({ name: 'notification_email_language' })
    public notificationEmailLanguage?: string;

    @Expose({ name: 'approval_required' })
    public approvalRequired?: boolean;

    @Expose({ name: 'approval_max_duration' })
    public approvalMaxDuration?: number;

    @Expose({ name: 'approval_scope' })
    public approvalScope?: ApprovalScopeType;

    @Expose({ name: 'approval_email_addresses' })
    public approvalEmailAddresses?: string[];

    @Expose({ name: 'approval_user_ids' })
    public approvalUserIds?: string[];

    @Expose({ name: 'approval_team_ids' })
    public approvalTeamIds?: string[];

    @Expose({ name: 'approval_display_name' })
    public approvalDisplayName?: string;

    @Expose({ name: 'approval_email_language' })
    public approvalEmailLanguage?: string;

    @Expose({ name: 'approval_approver_scope' })
    public approvalApproverScope?: ApprovalApproverScopeType;

    @Expose({ name: 'recordings_disabled' })
    public recordingsDisabled?: boolean;
}
