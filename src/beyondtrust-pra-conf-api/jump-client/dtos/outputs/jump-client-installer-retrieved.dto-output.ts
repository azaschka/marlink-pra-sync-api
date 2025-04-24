import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { JumpClientConnectionType, JumpClientGroupType } from '../../enums';
import { JumpClientInstallerKeyInfoRetrievedDtoOutput } from './jump-client-installer-key-info-retrieved.dto-output';

export class JumpClientInstallerRetrievedDtoOutput {
    @IsInt()
    @IsNotEmpty()
    public id!: number;

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

    @Expose({ name: 'connection_type' })
    @IsNotEmpty()
    public connectionType!: JumpClientConnectionType;

    @Expose({ name: 'expiration_timestamp' })
    @IsDateString()
    public expirationTimestamp!: Date;

    @Expose({ name: 'max_offline_minutes' })
    @IsInt()
    @IsNotEmpty()
    public maxOfflineMinutes!: number;

    @Expose({ name: 'elevate_install' })
    @IsBoolean()
    @IsNotEmpty()
    public elevateInstall!: boolean;

    @Expose({ name: 'elevate_prompt' })
    @IsBoolean()
    @IsNotEmpty()
    public elevatePrompt!: boolean;

    @Expose({ name: 'allow_override_jump_group' })
    @IsBoolean()
    @IsNotEmpty()
    public allowOverrideJumpGroup!: boolean;

    @Expose({ name: 'allow_override_jump_policy' })
    @IsBoolean()
    @IsNotEmpty()
    public allowOverrideJumpPolicy!: boolean;

    @Expose({ name: 'allow_override_name' })
    @IsBoolean()
    @IsNotEmpty()
    public allowOverrideName!: boolean;

    @Expose({ name: 'allow_override_tag' })
    @IsBoolean()
    @IsNotEmpty()
    public allowOverrideTag!: boolean;

    @Expose({ name: 'allow_override_comments' })
    @IsBoolean()
    @IsNotEmpty()
    public allowOverrideComments!: boolean;

    @Expose({ name: 'allow_override_session_policy' })
    @IsBoolean()
    @IsNotEmpty()
    public allowOverrideSessionPolicy!: boolean;

    @Expose({ name: 'installer_id' })
    @IsString()
    @IsNotEmpty()
    public installerId!: string;

    @Expose({ name: 'key_info' })
    @ValidateNested()
    @Type(() => JumpClientInstallerKeyInfoRetrievedDtoOutput)
    @IsNotEmpty()
    public keyInfo!: JumpClientInstallerKeyInfoRetrievedDtoOutput;

    @Expose({ name: 'jumpoint_proxy' })
    @IsString()
    @IsNotEmpty()
    public jumpointProxy!: string;
}
