import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { JumpClientEndpointAgreementPolicyType, JumpClientGroupType } from '../../enums';

export class ModifyJumpClientDtoInput {
    @Expose({ name: 'jump_group_id' })
    @IsInt()
    @IsNotEmpty()
    public jumpGroupId!: number;

    @Expose({ name: 'jump_group_type' })
    @IsNotEmpty()
    public jumpGroupType!: JumpClientGroupType;

    @IsString()
    @IsNotEmpty()
    public name!: string;

    @IsString()
    @IsNotEmpty()
    public tag!: string;

    @IsString()
    @IsNotEmpty()
    public comments!: string;

    @Expose({ name: 'jump_policy_id' })
    @IsInt()
    @IsNotEmpty()
    public jumpPolicyId!: number;

    @Expose({ name: 'session_policy_id' })
    @IsInt()
    @IsNotEmpty()
    public sessionPolicyId!: number;

    @Expose({ name: 'max_offline_minutes' })
    @IsInt()
    @IsNotEmpty()
    public maxOfflineMinutes!: number;

    @Expose({ name: 'endpoint_agreement_policy' })
    @IsNotEmpty()
    public endpointAgreementPolicy!: JumpClientEndpointAgreementPolicyType;
}
