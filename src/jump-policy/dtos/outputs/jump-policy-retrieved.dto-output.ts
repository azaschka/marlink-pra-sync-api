import { ApiProperty } from '@nestjs/swagger';
import {
    ApprovalApproverScopeType,
    ApprovalScopeType,
    SimultaneousJumpsRdpType,
    SimultaneousJumpsType,
} from '../../enums';
import { JumpPolicy } from '../../models';

export class JumpPolicyRetrievedDtoOutput implements JumpPolicy {
    @ApiProperty({ type: Number, required: true })
    public id!: number;

    @ApiProperty({ type: String, required: true })
    public displayName!: string;

    @ApiProperty({ type: String, required: false })
    public codeName?: string;

    @ApiProperty({ type: String, required: false })
    public description?: string;

    @ApiProperty({ type: Boolean, required: false })
    public hasScheduledAccessRestriction?: boolean;

    @ApiProperty({ enum: SimultaneousJumpsType, required: false })
    public simultaneousJumpsType?: SimultaneousJumpsType;

    @ApiProperty({ type: Boolean, required: false })
    public doesSimultaneousJumpBehaviorApplyToCopies?: boolean;

    @ApiProperty({ enum: SimultaneousJumpsRdpType, required: false })
    public simultaneousJumpsRdpType?: SimultaneousJumpsRdpType;

    @ApiProperty({ type: Boolean, required: false })
    public shouldForceRemoveUsersWhenScheduleDisallows?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    public isTicketIdRequired?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    public isTwoFactorChallengeRequired?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    public isSessionStartNotificationEnabled?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    public isSessionEndNotificationEnabled?: boolean;

    @ApiProperty({ type: [String], required: false })
    public notificationEmailAddresses?: string[];

    @ApiProperty({ type: String, required: false })
    public notificationDisplayName?: string;

    @ApiProperty({ type: String, required: false })
    public notificationEmailLanguage?: string;

    @ApiProperty({ type: Boolean, required: false })
    public isApprovalRequired?: boolean;

    @ApiProperty({ type: Number, required: false })
    public approvalMaxDurationInMinutes?: number;

    @ApiProperty({ enum: ApprovalScopeType, required: false })
    public approvalScopeType?: ApprovalScopeType;

    @ApiProperty({ type: [String], required: false })
    public approvalEmailAddresses?: string[];

    @ApiProperty({ type: [String], required: false })
    public approvalUserIds?: string[];

    @ApiProperty({ type: [String], required: false })
    public approvalTeamIds?: string[];

    @ApiProperty({ type: String, required: false })
    public approvalDisplayName?: string;

    @ApiProperty({ type: String, required: false })
    public approvalEmailLanguage?: string;

    @ApiProperty({ enum: ApprovalApproverScopeType, required: false })
    public approvalApproverScopeType?: ApprovalApproverScopeType;

    @ApiProperty({ type: Boolean, required: false })
    public isRecordingsDisabled?: boolean;
}
