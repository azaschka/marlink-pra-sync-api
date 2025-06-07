import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JumpGroupType, TunnelType } from '../../enums';

export class ModifyProtocolTunnelJumpDtoInput {
    @Expose({ name: 'name' })
    @IsString()
    @IsNotEmpty()
    public name!: string;

    @Expose({ name: 'jumpoint_id' })
    @IsInt()
    @IsNotEmpty()
    public jumpointId!: number;

    @Expose({ name: 'hostname' })
    @IsString()
    @IsNotEmpty()
    public hostname!: string;

    @Expose({ name: 'jump_group_id' })
    @IsInt()
    @IsNotEmpty()
    public jumpGroupId!: number;

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

    @Expose({ name: 'tunnel_listen_address' })
    @IsOptional()
    @IsString()
    public tunnelListenAddress?: string;

    @Expose({ name: 'tunnel_definitions' })
    @IsOptional()
    @IsString()
    public tunnelDefinitions?: string;

    @Expose({ name: 'tunnel_type' })
    @IsOptional()
    @IsEnum(TunnelType)
    public tunnelType?: TunnelType;

    @Expose({ name: 'username' })
    @IsOptional()
    @IsString()
    public username?: string;

    @Expose({ name: 'database' })
    @IsOptional()
    @IsString()
    public database?: string;

    @Expose({ name: 'url' })
    @IsOptional()
    @IsString()
    public url?: string;

    @Expose({ name: 'ca_certificates' })
    @IsOptional()
    @IsString()
    public caCertificates?: string;

    public static create(
        name: string,
        jumpointId: number,
        hostname: string,
        jumpGroupId: number,
        jumpGroupType?: JumpGroupType,
        tag?: string,
        comments?: string,
        jumpPolicyId?: number | null,
        sessionPolicyId?: number | null,
        tunnelListenAddress?: string,
        tunnelDefinitions?: string,
        tunnelType?: TunnelType,
        username?: string,
        database?: string,
        url?: string,
        caCertificates?: string,
    ): ModifyProtocolTunnelJumpDtoInput {
        const dto = new ModifyProtocolTunnelJumpDtoInput();
        dto.name = name;
        dto.jumpointId = jumpointId;
        dto.hostname = hostname;
        dto.jumpGroupId = jumpGroupId;
        dto.jumpGroupType = jumpGroupType;
        dto.tag = tag;
        dto.comments = comments;
        dto.jumpPolicyId = jumpPolicyId;
        dto.sessionPolicyId = sessionPolicyId;
        dto.tunnelListenAddress = tunnelListenAddress;
        dto.tunnelDefinitions = tunnelDefinitions;
        dto.tunnelType = tunnelType;
        dto.username = username;
        dto.database = database;
        dto.url = url;
        dto.caCertificates = caCertificates;

        return dto;
    }
}
