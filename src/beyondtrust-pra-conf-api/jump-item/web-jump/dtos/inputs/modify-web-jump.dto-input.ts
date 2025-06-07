import { Expose } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JumpGroupType, WebJumpUsernameFormat } from '../../enums';

export class ModifyWebJumpDtoInput {
    @Expose({ name: 'name' })
    @IsString()
    @IsNotEmpty()
    public name!: string;

    @Expose({ name: 'jumpoint_id' })
    @IsInt()
    @IsNotEmpty()
    public jumpointId!: number;

    @Expose({ name: 'url' })
    @IsString()
    @IsNotEmpty()
    public url!: string;

    @Expose({ name: 'jump_group_id' })
    @IsInt()
    @IsNotEmpty()
    public jumpGroupId!: number;

    @Expose({ name: 'jump_group_type' })
    @IsOptional()
    @IsEnum(JumpGroupType)
    public jumpGroupType?: JumpGroupType;

    @Expose({ name: 'username_format' })
    @IsOptional()
    @IsEnum(WebJumpUsernameFormat)
    public usernameFormat?: WebJumpUsernameFormat;

    @Expose({ name: 'verify_certificate' })
    @IsOptional()
    @IsBoolean()
    public verifyCertificate?: boolean;

    @Expose({ name: 'authentication_timeout' })
    @IsOptional()
    @IsInt()
    public authenticationTimeout?: number;

    @Expose({ name: 'tag' })
    @IsOptional()
    @IsString()
    public tag?: string;

    @Expose({ name: 'comments' })
    @IsOptional()
    @IsString()
    public comments?: string;

    @Expose({ name: 'jump_policy_id' })
    @IsOptional()
    @IsInt()
    public jumpPolicyId?: number | null;

    @Expose({ name: 'username_field' })
    @IsOptional()
    @IsString()
    public usernameField?: string | null;

    @Expose({ name: 'password_field' })
    @IsOptional()
    @IsString()
    public passwordField?: string | null;

    @Expose({ name: 'submit_field' })
    @IsOptional()
    @IsString()
    public submitField?: string | null;

    @Expose({ name: 'session_policy_id' })
    @IsOptional()
    @IsInt()
    public sessionPolicyId?: number | null;

    public static create(
        name: string,
        jumpointId: number,
        url: string,
        jumpGroupId: number,
        jumpGroupType?: JumpGroupType,
        usernameFormat?: WebJumpUsernameFormat,
        verifyCertificate?: boolean,
        authenticationTimeout?: number,
        tag?: string,
        comments?: string,
        jumpPolicyId?: number | null,
        usernameField?: string | null,
        passwordField?: string | null,
        submitField?: string | null,
        sessionPolicyId?: number | null,
    ): ModifyWebJumpDtoInput {
        const dto = new ModifyWebJumpDtoInput();
        dto.name = name;
        dto.jumpointId = jumpointId;
        dto.url = url;
        dto.jumpGroupId = jumpGroupId;
        dto.jumpGroupType = jumpGroupType;
        dto.usernameFormat = usernameFormat;
        dto.verifyCertificate = verifyCertificate;
        dto.authenticationTimeout = authenticationTimeout;
        dto.tag = tag;
        dto.comments = comments;
        dto.jumpPolicyId = jumpPolicyId;
        dto.usernameField = usernameField;
        dto.passwordField = passwordField;
        dto.submitField = submitField;
        dto.sessionPolicyId = sessionPolicyId;

        return dto;
    }
}
