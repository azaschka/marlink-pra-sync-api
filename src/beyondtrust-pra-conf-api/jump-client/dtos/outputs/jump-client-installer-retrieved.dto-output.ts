import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { JumpClientConnectionType, JumpClientGroupType } from '../../enums';
import { JumpClientInstallerKeyInfoRetrievedDtoOutput } from './jump-client-installer-key-info-retrieved.dto-output';

export class JumpClientInstallerRetrievedDtoOutput {
    public id?: number;

    @Expose({ name: 'jump_group_id' })
    public jumpGroupId?: number;

    @Expose({ name: 'jump_group_type' })
    public jumpGroupType?: JumpClientGroupType;

    public name?: string;

    public tag?: string;

    public comments?: string;

    @Expose({ name: 'jump_policy_id' })
    public jumpPolicyId?: number;

    @Expose({ name: 'session_policy_id' })
    public sessionPolicyId?: number | null;

    @Expose({ name: 'connection_type' })
    public connectionType?: JumpClientConnectionType;

    @Expose({ name: 'expiration_timestamp' })
    public expirationTimestamp?: Date;

    @Expose({ name: 'max_offline_minutes' })
    public maxOfflineMinutes?: number;

    @Expose({ name: 'elevate_install' })
    public elevateInstall?: boolean;

    @Expose({ name: 'elevate_prompt' })
    public elevatePrompt?: boolean;

    @Expose({ name: 'allow_override_jump_group' })
    public allowOverrideJumpGroup?: boolean;

    @Expose({ name: 'allow_override_jump_policy' })
    public allowOverrideJumpPolicy?: boolean;

    @Expose({ name: 'allow_override_name' })
    public allowOverrideName?: boolean;

    @Expose({ name: 'allow_override_tag' })
    public allowOverrideTag?: boolean;

    @Expose({ name: 'allow_override_comments' })
    public allowOverrideComments?: boolean;

    @Expose({ name: 'allow_override_session_policy' })
    public allowOverrideSessionPolicy?: boolean;

    @Expose({ name: 'installer_id' })
    public installerId?: string;

    @Expose({ name: 'key_info' })
    @ValidateNested()
    @Type(() => JumpClientInstallerKeyInfoRetrievedDtoOutput)
    public keyInfo?: JumpClientInstallerKeyInfoRetrievedDtoOutput;

    @Expose({ name: 'jumpoint_proxy' })
    public jumpointProxy?: string;
}
