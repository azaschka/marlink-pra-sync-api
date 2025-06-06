import { Expose } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JumpGroupType, RdpQualityMode, SecureAppType } from '../../enums';

export class ModifyRemoteRdpDtoInput {
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

    @Expose({ name: 'quality' })
    @IsOptional()
    @IsEnum(RdpQualityMode)
    public quality?: RdpQualityMode;

    @Expose({ name: 'console' })
    @IsOptional()
    @IsBoolean()
    public console?: boolean;

    @Expose({ name: 'ignore_untrusted' })
    @IsOptional()
    @IsBoolean()
    public ignoreUntrusted?: boolean;

    @Expose({ name: 'tag' })
    @IsOptional()
    @IsString()
    public tag?: string;

    @Expose({ name: 'comments' })
    @IsOptional()
    @IsString()
    public comments?: string;

    @Expose({ name: 'rdp_username' })
    @IsOptional()
    @IsString()
    public rdpUsername?: string;

    @Expose({ name: 'domain' })
    @IsOptional()
    @IsString()
    public domain?: string;

    @Expose({ name: 'jump_policy_id' })
    @IsOptional()
    @IsInt()
    public jumpPolicyId?: number | null;

    @Expose({ name: 'session_forensics' })
    @IsOptional()
    @IsBoolean()
    public sessionForensics?: boolean;

    @Expose({ name: 'session_policy_id' })
    @IsOptional()
    @IsInt()
    public sessionPolicyId?: number | null;

    @Expose({ name: 'secure_app_type' })
    @IsOptional()
    @IsEnum(SecureAppType)
    public secureAppType?: SecureAppType;

    @Expose({ name: 'remote_app_name' })
    @IsOptional()
    @IsString()
    public remoteAppName?: string;

    @Expose({ name: 'remote_app_params' })
    @IsOptional()
    @IsString()
    public remoteAppParams?: string;

    @Expose({ name: 'remote_exe_path' })
    @IsOptional()
    @IsString()
    public remoteExePath?: string;

    @Expose({ name: 'remote_exe_params' })
    @IsOptional()
    @IsString()
    public remoteExeParams?: string;

    @Expose({ name: 'target_system' })
    @IsOptional()
    @IsString()
    public targetSystem?: string;

    @Expose({ name: 'credential_type' })
    @IsOptional()
    @IsString()
    public credentialType?: string;

    public static create(
        name: string,
        jumpointId: number,
        hostname: string,
        jumpGroupId: number,
        jumpGroupType?: JumpGroupType,
        quality?: RdpQualityMode,
        console?: boolean,
        ignoreUntrusted?: boolean,
        tag?: string,
        comments?: string,
        rdpUsername?: string,
        domain?: string,
        jumpPolicyId?: number | null,
        sessionForensics?: boolean,
        sessionPolicyId?: number | null,
        secureAppType?: SecureAppType,
        remoteAppName?: string,
        remoteAppParams?: string,
        remoteExePath?: string,
        remoteExeParams?: string,
        targetSystem?: string,
        credentialType?: string,
    ): ModifyRemoteRdpDtoInput {
        const dto = new ModifyRemoteRdpDtoInput();
        dto.name = name;
        dto.jumpointId = jumpointId;
        dto.hostname = hostname;
        dto.jumpGroupId = jumpGroupId;
        dto.jumpGroupType = jumpGroupType;
        dto.quality = quality;
        dto.console = console;
        dto.ignoreUntrusted = ignoreUntrusted;
        dto.tag = tag;
        dto.comments = comments;
        dto.rdpUsername = rdpUsername;
        dto.domain = domain;
        dto.jumpPolicyId = jumpPolicyId;
        dto.sessionForensics = sessionForensics;
        dto.sessionPolicyId = sessionPolicyId;
        dto.secureAppType = secureAppType;
        dto.remoteAppName = remoteAppName;
        dto.remoteAppParams = remoteAppParams;
        dto.remoteExePath = remoteExePath;
        dto.remoteExeParams = remoteExeParams;
        dto.targetSystem = targetSystem;
        dto.credentialType = credentialType;

        return dto;
    }
}
