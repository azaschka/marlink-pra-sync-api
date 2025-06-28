import { Expose } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JumpClientConnectionType, JumpClientGroupType } from '../../enums';

export class CreateJumpClientInstallerDtoInput {
    @IsOptional()
    @IsString()
    @Expose({ name: 'name' })
    public name?: string;

    @IsNotEmpty()
    @IsInt()
    @Expose({ name: 'jump_group_id' })
    public jumpGroupId!: number;

    @IsEnum(JumpClientGroupType)
    @IsOptional()
    @Expose({ name: 'jump_group_type' })
    public jumpGroupType?: JumpClientGroupType;

    @IsOptional()
    @IsInt()
    @Expose({ name: 'jump_policy_id' })
    public jumpPolicyId?: number;

    @IsOptional()
    @IsString()
    @Expose({ name: 'tag' })
    public tag?: string;

    @IsEnum(JumpClientConnectionType)
    @IsOptional()
    @Expose({ name: 'connection_type' })
    public connectionType?: JumpClientConnectionType;

    @IsOptional()
    @IsInt()
    @Expose({ name: 'session_policy_id' })
    public sessionPolicyId?: number | null;

    @IsOptional()
    @IsString()
    @Expose({ name: 'comments' })
    public comments?: string;

    @IsOptional()
    @IsInt()
    @Expose({ name: 'valid_duration' })
    public validDuration?: number;

    @IsOptional()
    @IsBoolean()
    @Expose({ name: 'elevate_install' })
    public elevateInstall?: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose({ name: 'elevate_prompt' })
    public elevatePrompt?: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose({ name: 'allow_override_jump_group' })
    public allowOverrideJumpGroup?: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose({ name: 'allow_override_jump_policy' })
    public allowOverrideJumpPolicy?: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose({ name: 'allow_override_name' })
    public allowOverrideName?: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose({ name: 'allow_override_tag' })
    public allowOverrideTag?: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose({ name: 'allow_override_comments' })
    public allowOverrideComments?: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose({ name: 'allow_override_session_policy' })
    public allowOverrideSessionPolicy?: boolean;

    @IsOptional()
    @IsString()
    @Expose({ name: 'jumpoint_proxy' })
    public jumpointProxy?: string;

    public static create(
        jumpGroupId: number,
        name?: string,
        jumpGroupType?: JumpClientGroupType,
        jumpPolicyId?: number,
        tag?: string,
        connectionType?: JumpClientConnectionType,
        sessionPolicyId?: number | null,
        comments?: string,
        validDuration?: number,
        elevateInstall?: boolean,
        elevatePrompt?: boolean,
        allowOverrideJumpGroup?: boolean,
        allowOverrideJumpPolicy?: boolean,
        allowOverrideName?: boolean,
        allowOverrideTag?: boolean,
        allowOverrideComments?: boolean,
        allowOverrideSessionPolicy?: boolean,
        jumpointProxy?: string,
    ) {
        const dto = new CreateJumpClientInstallerDtoInput();
        dto.jumpGroupId = jumpGroupId;
        dto.name = name;
        dto.jumpGroupType = jumpGroupType;
        dto.jumpPolicyId = jumpPolicyId;
        dto.tag = tag;
        dto.connectionType = connectionType;
        dto.sessionPolicyId = sessionPolicyId;
        dto.comments = comments;
        dto.validDuration = validDuration;
        dto.elevateInstall = elevateInstall;
        dto.elevatePrompt = elevatePrompt;
        dto.allowOverrideJumpGroup = allowOverrideJumpGroup;
        dto.allowOverrideJumpPolicy = allowOverrideJumpPolicy;
        dto.allowOverrideName = allowOverrideName;
        dto.allowOverrideTag = allowOverrideTag;
        dto.allowOverrideComments = allowOverrideComments;
        dto.allowOverrideSessionPolicy = allowOverrideSessionPolicy;
        dto.jumpointProxy = jumpointProxy;

        return dto;
    }
}
