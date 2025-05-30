import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
    ApprovalApproverScopeType,
    ApprovalScopeType,
    SimultaneousJumpsRdpType,
    SimultaneousJumpsType,
} from '../../enums';

export class ModifyJumpPolicyDtoInput {
    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    public displayName?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    public codeName?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    public description?: string;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    public hasScheduledAccessRestriction?: boolean;

    @ApiProperty({ enum: SimultaneousJumpsType, required: false })
    @IsOptional()
    @IsEnum(SimultaneousJumpsType)
    public simultaneousJumpsType?: SimultaneousJumpsType;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    public doesSimultaneousJumpBehaviorApplyToCopies?: boolean;

    @ApiProperty({ enum: SimultaneousJumpsRdpType, required: false })
    @IsOptional()
    @IsEnum(SimultaneousJumpsRdpType)
    public simultaneousJumpsRdpType?: SimultaneousJumpsRdpType;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    public shouldForceRemoveUsersWhenScheduleDisallows?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    public isTicketIdRequired?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    public isTwoFactorChallengeRequired?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    public isSessionStartNotificationEnabled?: boolean;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    public isSessionEndNotificationEnabled?: boolean;

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayUnique()
    public notificationEmailAddresses?: string[];

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    public notificationDisplayName?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    public notificationEmailLanguage?: string;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    public isApprovalRequired?: boolean;

    @ApiProperty({ type: Number, required: false })
    @IsOptional()
    @IsNumber()
    public approvalMaxDurationInMinutes?: number;

    @ApiProperty({ enum: ApprovalScopeType, required: false })
    @IsOptional()
    @IsEnum(ApprovalScopeType)
    public approvalScopeType?: ApprovalScopeType;

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayUnique()
    public approvalEmailAddresses?: string[];

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayUnique()
    public approvalUserIds?: string[];

    @ApiProperty({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayUnique()
    public approvalTeamIds?: string[];

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    public approvalDisplayName?: string;

    @ApiProperty({ type: String, required: false })
    @IsOptional()
    @IsString()
    public approvalEmailLanguage?: string;

    @ApiProperty({ enum: ApprovalApproverScopeType, required: false })
    @IsOptional()
    @IsEnum(ApprovalApproverScopeType)
    public approvalApproverScopeType?: ApprovalApproverScopeType;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @IsBoolean()
    public isRecordingsDisabled?: boolean;
}
