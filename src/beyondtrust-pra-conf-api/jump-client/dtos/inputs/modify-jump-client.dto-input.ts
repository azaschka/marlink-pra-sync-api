import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JumpClientEndpointAgreementPolicyType, JumpClientGroupType } from '../../enums';

export class ModifyJumpClientDtoInput {
    @Expose({ name: 'jump_group_id' })
    @IsInt()
    @IsNotEmpty()
    public jumpGroupId!: number;

    @Expose({ name: 'jump_group_type' })
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
    @IsOptional()
    public endpointAgreementPolicy?: JumpClientEndpointAgreementPolicyType;
}
