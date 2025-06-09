import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { JumpGroupType } from '../../enums';

export class ModifyRemoteVncDtoInput {
    @Expose({ name: 'name' })
    @IsString()
    @IsOptional()
    public name?: string;

    @Expose({ name: 'jumpoint_id' })
    @IsInt()
    @IsOptional()
    public jumpointId?: number;

    @Expose({ name: 'hostname' })
    @IsString()
    @IsOptional()
    public hostname?: string;

    @Expose({ name: 'port' })
    @IsOptional()
    @IsInt()
    public port?: number;

    @Expose({ name: 'jump_group_id' })
    @IsInt()
    @IsOptional()
    public jumpGroupId?: number;

    @Expose({ name: 'jump_group_type' })
    @IsOptional()
    @IsEnum(JumpGroupType)
    public jumpGroupType?: JumpGroupType;

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

    @Expose({ name: 'session_policy_id' })
    @IsOptional()
    @IsInt()
    public sessionPolicyId?: number | null;

    public static create(
        name?: string,
        jumpointId?: number,
        hostname?: string,
        port?: number,
        jumpGroupId?: number,
        jumpGroupType?: JumpGroupType,
        tag?: string,
        comments?: string,
        jumpPolicyId?: number | null,
        sessionPolicyId?: number | null,
    ): ModifyRemoteVncDtoInput {
        const dto = new ModifyRemoteVncDtoInput();
        dto.name = name;
        dto.jumpointId = jumpointId;
        dto.hostname = hostname;
        dto.port = port;
        dto.jumpGroupId = jumpGroupId;
        dto.jumpGroupType = jumpGroupType;
        dto.tag = tag;
        dto.comments = comments;
        dto.jumpPolicyId = jumpPolicyId;
        dto.sessionPolicyId = sessionPolicyId;

        return dto;
    }
}
