import { Expose } from 'class-transformer';
import {
    JumpClientConnectionType,
    JumpClientEndpointAgreementPolicyType,
    JumpClientGroupType,
    JumpClientInstallMode,
    JumpClientUnavailableReasonType,
} from '../../enums';

export class JumpClientRetrievedDtoOutput {
    @Expose({ name: 'jump_group_id' })
    public jumpGroupId!: number;

    public id?: number;

    @Expose({ name: 'jump_group_type' })
    public jumpGroupType?: JumpClientGroupType;

    public name?: string;

    public hostname?: string;

    public fqdn?: string;

    public tag?: string;

    public comments?: string;

    @Expose({ name: 'jump_policy_id' })
    public jumpPolicyId?: number | null;

    @Expose({ name: 'session_policy_id' })
    public sessionPolicyId?: number | null;

    @Expose({ name: 'install_mode' })
    public installMode?: JumpClientInstallMode;

    @Expose({ name: 'connection_type' })
    public connectionType?: JumpClientConnectionType;

    @Expose({ name: 'last_connect_timestamp' })
    public lastConnectTimestamp?: Date;

    @Expose({ name: 'last_disconnect_timestamp' })
    public lastDisconnectTimestamp?: Date;

    @Expose({ name: 'is_lost' })
    public isLost?: boolean;

    @Expose({ name: 'needs_update' })
    public needsUpdate?: boolean;

    @Expose({ name: 'unavailable_reason' })
    public unavailableReason?: JumpClientUnavailableReasonType;

    @Expose({ name: 'operating_system' })
    public operatingSystem?: string;

    @Expose({ name: 'public_ip' })
    public publicIp?: string;

    @Expose({ name: 'private_ip' })
    public privateIp?: string;

    @Expose({ name: 'console_user' })
    public consoleUser?: string;

    @Expose({ name: 'expiration_timestamp' })
    public expirationTimestamp?: Date;

    @Expose({ name: 'max_offline_minutes' })
    public maxOfflineMinutes?: number;

    @Expose({ name: 'last_access_timestamp' })
    public lastAccessTimestamp?: Date;

    @Expose({ name: 'endpoint_agreement_policy' })
    public endpointAgreementPolicy?: JumpClientEndpointAgreementPolicyType;

    @Expose({ name: 'jumpoint_proxy' })
    public jumpointProxy?: string | null;
}
