import { Expose } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import {
    ApprovalApproverScopeType,
    ApprovalScopeType,
    SimultaneousJumpsRdpType,
    SimultaneousJumpsType,
} from '../../enums';

export class ModifyJumpPolicyDtoInput {
    @Expose({ name: 'display_name' })
    @IsNotEmpty()
    @IsString()
    public displayName!: string;

    @Expose({ name: 'code_name' })
    @IsOptional()
    @IsString()
    public codeName?: string;

    @Expose({ name: 'description' })
    @IsOptional()
    @IsString()
    public description?: string;

    @Expose({ name: 'schedule_enabled' })
    @IsOptional()
    @IsBoolean()
    public scheduleEnabled?: boolean;

    @Expose({ name: 'simultaneous_jumps' })
    @IsOptional()
    public simultaneousJumps?: SimultaneousJumpsType;

    @Expose({ name: 'simultaneous_jump_behavior_applies_to_copies' })
    @IsOptional()
    @IsBoolean()
    public simultaneousJumpBehaviorAppliesToCopies?: boolean;

    @Expose({ name: 'simultaneous_jumps_rdp' })
    @IsOptional()
    public simultaneousJumpsRdp?: SimultaneousJumpsRdpType;

    @Expose({ name: 'schedule_strict' })
    @IsOptional()
    @IsBoolean()
    public scheduleStrict?: boolean;

    @Expose({ name: 'ticket_id_required' })
    @IsOptional()
    @IsBoolean()
    public ticketIdRequired?: boolean;

    @Expose({ name: 'two_factor_challenge_required' })
    @IsOptional()
    @IsBoolean()
    public twoFactorChallengeRequired?: boolean;

    @Expose({ name: 'session_start_notification' })
    @IsOptional()
    @IsBoolean()
    public sessionStartNotification?: boolean;

    @Expose({ name: 'session_end_notification' })
    @IsOptional()
    @IsBoolean()
    public sessionEndNotification?: boolean;

    @Expose({ name: 'notification_email_addresses' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    public notificationEmailAddresses?: string[];

    @Expose({ name: 'notification_display_name' })
    @IsOptional()
    @IsString()
    public notificationDisplayName?: string;

    @Expose({ name: 'notification_email_language' })
    @IsOptional()
    @IsString()
    public notificationEmailLanguage?: string;

    @Expose({ name: 'approval_required' })
    @IsOptional()
    @IsBoolean()
    public approvalRequired?: boolean;

    @Expose({ name: 'approval_max_duration' })
    @IsOptional()
    @IsNumber()
    public approvalMaxDuration?: number;

    @Expose({ name: 'approval_scope' })
    @IsOptional()
    public approvalScope?: ApprovalScopeType;

    @Expose({ name: 'approval_email_addresses' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    public approvalEmailAddresses?: string[];

    @Expose({ name: 'approval_user_ids' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    public approvalUserIds?: string[];

    @Expose({ name: 'approval_team_ids' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    public approvalTeamIds?: string[];

    @Expose({ name: 'approval_display_name' })
    @IsOptional()
    @IsString()
    public approvalDisplayName?: string;

    @Expose({ name: 'approval_email_language' })
    @IsOptional()
    @IsString()
    public approvalEmailLanguage?: string;

    @Expose({ name: 'approval_approver_scope' })
    @IsOptional()
    public approvalApproverScope?: ApprovalApproverScopeType;

    @Expose({ name: 'recordings_disabled' })
    @IsOptional()
    @IsBoolean()
    public recordingsDisabled?: boolean;

    public static create(
        displayName: string,
        codeName?: string,
        description?: string,
        scheduleEnabled?: boolean,
        simultaneousJumps?: SimultaneousJumpsType,
        simultaneousJumpBehaviorAppliesToCopies?: boolean,
        simultaneousJumpsRdp?: SimultaneousJumpsRdpType,
        scheduleStrict?: boolean,
        ticketIdRequired?: boolean,
        twoFactorChallengeRequired?: boolean,
        sessionStartNotification?: boolean,
        sessionEndNotification?: boolean,
        notificationEmailAddresses?: string[],
        notificationDisplayName?: string,
        notificationEmailLanguage?: string,
        approvalRequired?: boolean,
        approvalMaxDuration?: number,
        approvalScope?: ApprovalScopeType,
        approvalEmailAddresses?: string[],
        approvalUserIds?: string[],
        approvalTeamIds?: string[],
        approvalDisplayName?: string,
        approvalEmailLanguage?: string,
        approvalApproverScope?: ApprovalApproverScopeType,
        recordingsDisabled?: boolean,
    ): ModifyJumpPolicyDtoInput {
        const dto = new ModifyJumpPolicyDtoInput();
        dto.displayName = displayName;
        dto.codeName = codeName;
        dto.description = description;
        dto.scheduleEnabled = scheduleEnabled;
        dto.simultaneousJumps = simultaneousJumps;
        dto.simultaneousJumpBehaviorAppliesToCopies = simultaneousJumpBehaviorAppliesToCopies;
        dto.simultaneousJumpsRdp = simultaneousJumpsRdp;
        dto.scheduleStrict = scheduleStrict;
        dto.ticketIdRequired = ticketIdRequired;
        dto.twoFactorChallengeRequired = twoFactorChallengeRequired;
        dto.sessionStartNotification = sessionStartNotification;
        dto.sessionEndNotification = sessionEndNotification;
        dto.notificationEmailAddresses = notificationEmailAddresses;
        dto.notificationDisplayName = notificationDisplayName;
        dto.notificationEmailLanguage = notificationEmailLanguage;
        dto.approvalRequired = approvalRequired;
        dto.approvalMaxDuration = approvalMaxDuration;
        dto.approvalScope = approvalScope;
        dto.approvalEmailAddresses = approvalEmailAddresses;
        dto.approvalUserIds = approvalUserIds;
        dto.approvalTeamIds = approvalTeamIds;
        dto.approvalDisplayName = approvalDisplayName;
        dto.approvalEmailLanguage = approvalEmailLanguage;
        dto.approvalApproverScope = approvalApproverScope;
        dto.recordingsDisabled = recordingsDisabled;

        return dto;
    }
}
