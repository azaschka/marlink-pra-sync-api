import { Expose } from 'class-transformer';
import { JumpGroupType, TunnelType } from '../../enums';

export class ProtocolTunnelJumpCreatedDtoOutput {
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

    @Expose({ name: 'tag' })
    public tag?: string;

    @Expose({ name: 'comments' })
    public comments?: string;

    @Expose({ name: 'jump_policy_id' })
    public jumpPolicyId?: number | null;

    @Expose({ name: 'session_policy_id' })
    public sessionPolicyId?: number | null;

    @Expose({ name: 'tunnel_listen_address' })
    public tunnelListenAddress?: string;

    @Expose({ name: 'tunnel_definitions' })
    public tunnelDefinitions?: string;

    @Expose({ name: 'tunnel_type' })
    public tunnelType?: TunnelType;

    @Expose({ name: 'username' })
    public username?: string;

    @Expose({ name: 'database' })
    public database?: string;

    @Expose({ name: 'url' })
    public url?: string;

    @Expose({ name: 'ca_certificates' })
    public caCertificates?: string;
}
