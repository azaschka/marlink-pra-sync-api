import { Column, Entity } from 'typeorm';
import { DateUtility } from '../../../shared/utilities';
import {
    ApprovalApproverScopeType,
    ApprovalScopeType,
    SimultaneousJumpsRdpType,
    SimultaneousJumpsType,
} from '../../enums';
import { JumpPolicy } from '../../models';

@Entity({ name: 'jump_policies' })
export class JumpPolicyEntity implements JumpPolicy {
    @Column({ name: 'id', type: 'int', unique: true, primary: true, generated: false })
    public id!: number;

    @Column({ name: 'display_name', type: 'varchar', length: 255 })
    public displayName!: string;

    @Column({ name: 'code_name', type: 'varchar', length: 255, nullable: true })
    public codeName?: string;

    @Column({ name: 'description', type: 'varchar', length: 1024, nullable: true })
    public description?: string;

    @Column({ name: 'has_scheduled_access_restriction', type: 'boolean', nullable: true })
    public hasScheduledAccessRestriction?: boolean;

    @Column({
        name: 'simultaneous_jumps_type',
        type: 'enum',
        enum: SimultaneousJumpsType,
        nullable: true,
    })
    public simultaneousJumpsType?: SimultaneousJumpsType;

    @Column({ name: 'does_simultaneous_jump_behavior_apply_to_copies', type: 'boolean', nullable: true })
    public doesSimultaneousJumpBehaviorApplyToCopies?: boolean;

    @Column({
        name: 'simultaneous_jumps_rdp_type',
        type: 'enum',
        enum: SimultaneousJumpsRdpType,
        nullable: true,
    })
    public simultaneousJumpsRdpType?: SimultaneousJumpsRdpType;

    @Column({ name: 'should_force_remove_users_when_schedule_disallows', type: 'boolean', nullable: true })
    public shouldForceRemoveUsersWhenScheduleDisallows?: boolean;

    @Column({ name: 'is_ticket_id_required', type: 'boolean', nullable: true })
    public isTicketIdRequired?: boolean;

    @Column({ name: 'is_two_factor_challenge_required', type: 'boolean', nullable: true })
    public isTwoFactorChallengeRequired?: boolean;

    @Column({ name: 'is_session_start_notification_enabled', type: 'boolean', nullable: true })
    public isSessionStartNotificationEnabled?: boolean;

    @Column({ name: 'is_session_end_notification_enabled', type: 'boolean', nullable: true })
    public isSessionEndNotificationEnabled?: boolean;

    @Column({ name: 'notification_email_addresses', type: 'simple-array', nullable: true })
    public notificationEmailAddresses?: string[];

    @Column({ name: 'notification_display_name', type: 'varchar', length: 255, nullable: true })
    public notificationDisplayName?: string;

    @Column({ name: 'notification_email_language', type: 'varchar', length: 16, nullable: true })
    public notificationEmailLanguage?: string;

    @Column({ name: 'is_approval_required', type: 'boolean', nullable: true })
    public isApprovalRequired?: boolean;

    @Column({ name: 'approval_max_duration_in_minutes', type: 'int', nullable: true })
    public approvalMaxDurationInMinutes?: number;

    @Column({
        name: 'approval_scope_type',
        type: 'enum',
        enum: ApprovalScopeType,
        nullable: true,
    })
    public approvalScopeType?: ApprovalScopeType;

    @Column({ name: 'approval_email_addresses', type: 'simple-array', nullable: true })
    public approvalEmailAddresses?: string[];

    @Column({ name: 'approval_user_ids', type: 'simple-array', nullable: true })
    public approvalUserIds?: string[];

    @Column({ name: 'approval_team_ids', type: 'simple-array', nullable: true })
    public approvalTeamIds?: string[];

    @Column({ name: 'approval_display_name', type: 'varchar', length: 255, nullable: true })
    public approvalDisplayName?: string;

    @Column({ name: 'approval_email_language', type: 'varchar', length: 16, nullable: true })
    public approvalEmailLanguage?: string;

    @Column({
        name: 'approval_approver_scope_type',
        type: 'enum',
        enum: ApprovalApproverScopeType,
        nullable: true,
    })
    public approvalApproverScopeType?: ApprovalApproverScopeType;

    @Column({ name: 'is_recordings_disabled', type: 'boolean', nullable: true })
    public isRecordingsDisabled?: boolean;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    public static create(
        id: number,
        displayName: string,
        codeName?: string,
        description?: string,
        hasScheduledAccessRestriction?: boolean,
        simultaneousJumpsType?: SimultaneousJumpsType,
        doesSimultaneousJumpBehaviorApplyToCopies?: boolean,
        simultaneousJumpsRdpType?: SimultaneousJumpsRdpType,
        shouldForceRemoveUsersWhenScheduleDisallows?: boolean,
        isTicketIdRequired?: boolean,
        isTwoFactorChallengeRequired?: boolean,
        isSessionStartNotificationEnabled?: boolean,
        isSessionEndNotificationEnabled?: boolean,
        notificationEmailAddresses?: string[],
        notificationDisplayName?: string,
        notificationEmailLanguage?: string,
        isApprovalRequired?: boolean,
        approvalMaxDurationInMinutes?: number,
        approvalScopeType?: ApprovalScopeType,
        approvalEmailAddresses?: string[],
        approvalUserIds?: string[],
        approvalTeamIds?: string[],
        approvalDisplayName?: string,
        approvalEmailLanguage?: string,
        approvalApproverScopeType?: ApprovalApproverScopeType,
        isRecordingsDisabled?: boolean,
    ): JumpPolicyEntity {
        const entity = new JumpPolicyEntity();
        entity.id = id;
        entity.displayName = displayName;
        entity.codeName = codeName;
        entity.description = description;
        entity.hasScheduledAccessRestriction = hasScheduledAccessRestriction;
        entity.simultaneousJumpsType = simultaneousJumpsType;
        entity.doesSimultaneousJumpBehaviorApplyToCopies = doesSimultaneousJumpBehaviorApplyToCopies;
        entity.simultaneousJumpsRdpType = simultaneousJumpsRdpType;
        entity.shouldForceRemoveUsersWhenScheduleDisallows = shouldForceRemoveUsersWhenScheduleDisallows;
        entity.isTicketIdRequired = isTicketIdRequired;
        entity.isTwoFactorChallengeRequired = isTwoFactorChallengeRequired;
        entity.isSessionStartNotificationEnabled = isSessionStartNotificationEnabled;
        entity.isSessionEndNotificationEnabled = isSessionEndNotificationEnabled;
        entity.notificationEmailAddresses = notificationEmailAddresses;
        entity.notificationDisplayName = notificationDisplayName;
        entity.notificationEmailLanguage = notificationEmailLanguage;
        entity.isApprovalRequired = isApprovalRequired;
        entity.approvalMaxDurationInMinutes = approvalMaxDurationInMinutes;
        entity.approvalScopeType = approvalScopeType;
        entity.approvalEmailAddresses = approvalEmailAddresses;
        entity.approvalUserIds = approvalUserIds;
        entity.approvalTeamIds = approvalTeamIds;
        entity.approvalDisplayName = approvalDisplayName;
        entity.approvalEmailLanguage = approvalEmailLanguage;
        entity.approvalApproverScopeType = approvalApproverScopeType;
        entity.isRecordingsDisabled = isRecordingsDisabled;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
