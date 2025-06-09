import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { JumpGroupType, ShellJumpProtocolType, ShellJumpTerminalType } from '../../enums';

export class ModifyShellJumpDtoInput {
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

    @Expose({ name: 'protocol' })
    @IsEnum(ShellJumpProtocolType)
    @IsOptional()
    public protocol?: ShellJumpProtocolType;

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

    @Expose({ name: 'terminal' })
    @IsOptional()
    @IsEnum(ShellJumpTerminalType)
    public terminal?: ShellJumpTerminalType;

    @Expose({ name: 'keep_alive' })
    @IsOptional()
    @IsInt()
    public keepAlive?: number;

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

    @Expose({ name: 'username' })
    @IsOptional()
    @IsString()
    public username?: string;

    @Expose({ name: 'session_policy_id' })
    @IsOptional()
    @IsInt()
    public sessionPolicyId?: number | null;

    public static create(
        name?: string,
        jumpointId?: number,
        hostname?: string,
        protocol?: ShellJumpProtocolType,
        port?: number,
        jumpGroupId?: number,
        jumpGroupType?: JumpGroupType,
        terminal?: ShellJumpTerminalType,
        keepAlive?: number,
        tag?: string,
        comments?: string,
        jumpPolicyId?: number | null,
        username?: string,
        sessionPolicyId?: number | null,
    ): ModifyShellJumpDtoInput {
        const dto = new ModifyShellJumpDtoInput();
        dto.name = name;
        dto.jumpointId = jumpointId;
        dto.hostname = hostname;
        dto.protocol = protocol;
        dto.port = port;
        dto.jumpGroupId = jumpGroupId;
        dto.jumpGroupType = jumpGroupType;
        dto.terminal = terminal;
        dto.keepAlive = keepAlive;
        dto.tag = tag;
        dto.comments = comments;
        dto.jumpPolicyId = jumpPolicyId;
        dto.username = username;
        dto.sessionPolicyId = sessionPolicyId;

        return dto;
    }
}
