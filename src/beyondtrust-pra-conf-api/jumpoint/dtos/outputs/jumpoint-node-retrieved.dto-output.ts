import { Expose } from 'class-transformer';

export class JumpointNodeRetrievedDtoOutput {
    public id!: number;

    @Expose({ name: 'last_connect_timestamp' })
    public lastConnectTimestamp?: Date | null;

    @Expose({ name: 'last_disconnect_timestamp' })
    public lastDisconnectTimestamp?: Date | null;

    @Expose({ name: 'public_ip' })
    public publicIp!: string;

    @Expose({ name: 'private_ip' })
    public privateIp!: string;

    @Expose({ name: 'hostname' })
    public hostname!: string;
}
