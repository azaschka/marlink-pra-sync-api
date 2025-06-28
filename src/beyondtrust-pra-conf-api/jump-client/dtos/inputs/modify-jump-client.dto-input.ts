import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { JumpClientEndpointAgreementPolicyType, JumpClientGroupType } from '../../enums';

export class ModifyJumpClientDtoInput {
    @Expose({ name: 'jump_group_id' })
    @IsInt()
    @IsOptional()
    public jumpGroupId?: number;

    @Expose({ name: 'jump_group_type' })
    @IsEnum(JumpClientGroupType)
    @IsOptional()
    public jumpGroupType?: JumpClientGroupType;

    @IsString()
    @IsOptional()
    public name?: string;

    @IsString()
    @IsOptional()
    public tag?: string;

    @IsString()
    @IsOptional()
    public comments?: string;

    @Expose({ name: 'jump_policy_id' })
    @IsInt()
    @IsOptional()
    public jumpPolicyId?: number | null;

    @Expose({ name: 'session_policy_id' })
    @IsInt()
    @IsOptional()
    public sessionPolicyId?: number | null;

    @Expose({ name: 'max_offline_minutes' })
    @IsInt()
    @IsOptional()
    public maxOfflineMinutes?: number;

    @Expose({ name: 'endpoint_agreement_policy' })
    @IsEnum(JumpClientEndpointAgreementPolicyType)
    @IsOptional()
    public endpointAgreementPolicy?: JumpClientEndpointAgreementPolicyType;

    public static create(
        jumpGroupId?: number,
        jumpGroupType?: JumpClientGroupType,
        name?: string,
        tag?: string,
        comments?: string,
        jumpPolicyId?: number | null,
        sessionPolicyId?: number | null,
        maxOfflineMinutes?: number,
        endpointAgreementPolicy?: JumpClientEndpointAgreementPolicyType,
    ): ModifyJumpClientDtoInput {
        const dto = new ModifyJumpClientDtoInput();
        dto.jumpGroupId = jumpGroupId;
        dto.jumpGroupType = jumpGroupType;
        dto.name = name;
        dto.tag = tag;
        dto.comments = comments;
        dto.jumpPolicyId = jumpPolicyId;
        dto.sessionPolicyId = sessionPolicyId;
        dto.maxOfflineMinutes = maxOfflineMinutes;
        dto.endpointAgreementPolicy = endpointAgreementPolicy;

        return dto;
    }
}
