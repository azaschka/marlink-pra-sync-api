import { Expose } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class JumpClientRetrievedDtoOutput {
    @Expose({ name: 'jump_group_id' })
    @IsInt()
    @IsNotEmpty()
    public jumpGroupId!: number;

    @IsInt()
    @IsNotEmpty()
    public id!: number;

    @Expose({ name: 'jump_group_type' })
    @IsNotEmpty()
    public jumpGroupType!: 'shared'; // TODO

    @IsString()
    @IsNotEmpty()
    public name!: string;

    @IsString()
    @IsNotEmpty()
    public hostname!: string;

    @IsString()
    @IsNotEmpty()
    public fqdn!: string;

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

    @Expose({ name: 'install_mode' })
    @IsNotEmpty()
    public installMode!: 'unknown'; // TODO

    @Expose({ name: 'connection_type' })
    @IsNotEmpty()
    public connectionType!: 'active'; // TODO

    @Expose({ name: 'last_connect_timestamp' })
    @IsDateString()
    @IsNotEmpty()
    public lastConnectTimestamp!: Date;

    @Expose({ name: 'last_disconnect_timestamp' })
    @IsDateString()
    @IsNotEmpty()
    public lastDisconnectTimestamp!: Date;

    @Expose({ name: 'is_lost' })
    @IsBoolean()
    @IsNotEmpty()
    public isLost!: boolean;

    @Expose({ name: 'needs_update' })
    @IsBoolean()
    @IsNotEmpty()
    public needsUpdate!: boolean;

    @Expose({ name: 'unavailable_reason' })
    @IsNotEmpty()
    public unavailableReason!: 'none'; // TODO

    @Expose({ name: 'operating_system' })
    @IsString()
    @IsNotEmpty()
    public operatingSystem!: string;

    @Expose({ name: 'public_ip' })
    @IsString()
    @IsNotEmpty()
    public publicIp!: string;

    @Expose({ name: 'private_ip' })
    @IsString()
    @IsNotEmpty()
    public privateIp!: string;

    @Expose({ name: 'console_user' })
    @IsString()
    @IsNotEmpty()
    public consoleUser!: string;

    @Expose({ name: 'expiration_timestamp' })
    @IsDateString()
    @IsNotEmpty()
    public expirationTimestamp!: Date;

    @Expose({ name: 'max_offline_minutes' })
    @IsInt()
    @IsNotEmpty()
    public maxOfflineMinutes!: number;

    @Expose({ name: 'last_access_timestamp' })
    @IsDateString()
    @IsNotEmpty()
    public lastAccessTimestamp!: Date;

    @Expose({ name: 'endpoint_agreement_policy' })
    @IsNotEmpty()
    public endpointAgreementPolicy!: 'no_prompt'; // TODO
}
