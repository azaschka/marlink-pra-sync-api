import { Expose } from 'class-transformer';
import { JumpGroupType, RdpQualityMode, SecureAppType } from '../../enums';

export class RemoteRdpRetrievedDtoOutput {
    @Expose({ name: 'id' })
    public id!: number;

    @Expose({ name: 'name' })
    public name!: string;

    @Expose({ name: 'jumpoint_id' })
    public jumpointId!: number;

    @Expose({ name: 'hostname' })
    public hostname!: string;

    @Expose({ name: 'jump_group_id' })
    public jumpGroupId!: number;

    @Expose({ name: 'jump_group_type' })
    public jumpGroupType?: JumpGroupType;

    @Expose({ name: 'quality' })
    public quality?: RdpQualityMode;

    @Expose({ name: 'console' })
    public console?: boolean;

    @Expose({ name: 'ignore_untrusted' })
    public ignoreUntrusted?: boolean;

    @Expose({ name: 'tag' })
    public tag?: string;

    @Expose({ name: 'comments' })
    public comments?: string;

    @Expose({ name: 'rdp_username' })
    public rdpUsername?: string;

    @Expose({ name: 'domain' })
    public domain?: string;

    @Expose({ name: 'jump_policy_id' })
    public jumpPolicyId?: number | null;

    @Expose({ name: 'session_forensics' })
    public sessionForensics?: boolean;

    @Expose({ name: 'session_policy_id' })
    public sessionPolicyId?: number | null;

    @Expose({ name: 'endpoint_id' })
    public endpointId?: number | null;

    @Expose({ name: 'secure_app_type' })
    public secureAppType?: SecureAppType;

    @Expose({ name: 'remote_app_name' })
    public remoteAppName?: string;

    @Expose({ name: 'remote_app_params' })
    public remoteAppParams?: string;

    @Expose({ name: 'remote_exe_path' })
    public remoteExePath?: string;

    @Expose({ name: 'remote_exe_params' })
    public remoteExeParams?: string;

    @Expose({ name: 'target_system' })
    public targetSystem?: string;

    @Expose({ name: 'credential_type' })
    public credentialType?: string;
}
