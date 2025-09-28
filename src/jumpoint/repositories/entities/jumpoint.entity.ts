import { Column, Entity, OneToMany } from 'typeorm';
import { GroupPolicyJumpointEntity } from '../../../group-policy-jumpoint/repositories/entities';
import { ProtocolTunnelJumpEntity } from '../../../jump-item/protocol-tunnel-jump/repositories/entities';
import { RemoteRdpEntity } from '../../../jump-item/remote-rdp/repositories/entities';
import { RemoteVncEntity } from '../../../jump-item/remote-vnc/repositories/entities';
import { ShellJumpEntity } from '../../../jump-item/shell-jump/repositories/entities';
import { WebJumpEntity } from '../../../jump-item/web-jump/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../../enums';
import { Jumpoint, JumpointIpRange } from '../../models';
import { JumpointNodeEntity } from './jumpoint-node.entity';

@Entity({ name: 'jumpoints' })
export class JumpointEntity implements Jumpoint {
    @Column({ name: 'id', type: 'int', unique: true, primary: true, generated: false })
    public id!: number;

    @Column({ name: 'name', type: 'varchar' })
    public name!: string;

    @Column({ name: 'platform_type', type: 'enum', enum: JumpointPlatformType })
    public platformType!: JumpointPlatformType;

    @Column({ name: 'code_name', type: 'varchar', nullable: true })
    public codeName?: string;

    @Column({ name: 'comments', type: 'text', nullable: true })
    public comments?: string;

    @Column({ name: 'is_enabled', type: 'boolean', nullable: true })
    public isEnabled?: boolean;

    @Column({ name: 'is_connected', type: 'boolean', nullable: true })
    public isConnected?: boolean;

    @Column({ name: 'is_clustered', type: 'boolean', nullable: true })
    public isClustered?: boolean;

    @Column({ name: 'is_shell_jump_enabled', type: 'boolean', nullable: true })
    public isShellJumpEnabled?: boolean;

    @Column({ name: 'external_jump_item_network_id', type: 'text', nullable: true })
    public externalJumpItemNetworkId?: string;

    @Column({ name: 'is_protocol_tunnel_enabled', type: 'boolean', nullable: true })
    public isProtocolTunnelEnabled?: boolean;

    @Column({ name: 'rdp_service_account_id', type: 'int', nullable: true })
    public rdpServiceAccountId?: number | null;

    @Column({ name: 'managed_ip_ranges', type: 'json', nullable: true })
    public managedIpRanges?: JumpointIpRange[];

    @Column({ name: 'is_jzp_enabled', type: 'boolean', nullable: true })
    public isJzpEnabled?: boolean;

    @Column({ name: 'jzp_proxy_hostname', type: 'text', nullable: true })
    public jzpProxyHostname?: string;

    @Column({ name: 'jzp_proxy_port', type: 'int', nullable: true })
    public jzpProxyPort?: number;

    @Column({ name: 'is_jzp_http_get_allowed', type: 'boolean', nullable: true })
    public isJzpHttpGetAllowed?: boolean;

    @Column({
        name: 'jzp_client_address_restrictions_type',
        type: 'enum',
        enum: JzpClientAddressRestrictionsType,
        nullable: true,
    })
    public jzpClientAddressRestrictionsType?: JzpClientAddressRestrictionsType;

    @Column({ name: 'jzp_restricted_ips', type: 'simple-array', nullable: true })
    public jzpRestrictedIps?: string[];

    @Column({ name: 'docker_deploy_key', type: 'varchar', nullable: true })
    public dockerDeployKey?: string;

    @Column({ name: 'key_info', type: 'varchar', nullable: true })
    public keyInfo?: string;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    @OneToMany(() => GroupPolicyJumpointEntity, (groupPolicyJumpoint) => groupPolicyJumpoint.jumpoint)
    public groupPolicyJumpoints?: GroupPolicyJumpointEntity[];

    @OneToMany(() => ProtocolTunnelJumpEntity, (protocolTunnelJumpEntity) => protocolTunnelJumpEntity.jumpoint)
    public protocolTunnelJumps?: ProtocolTunnelJumpEntity[];

    @OneToMany(() => RemoteRdpEntity, (remoteRdpEntity) => remoteRdpEntity.jumpoint)
    public remoteRdps?: RemoteRdpEntity[];

    @OneToMany(() => RemoteVncEntity, (remoteVncEntity) => remoteVncEntity.jumpoint)
    public remoteVncs?: RemoteVncEntity[];

    @OneToMany(() => ShellJumpEntity, (shellJumpEntity) => shellJumpEntity.jumpoint)
    public shellJumps?: ShellJumpEntity[];

    @OneToMany(() => WebJumpEntity, (webJumpEntity) => webJumpEntity.jumpoint)
    public webJumps?: WebJumpEntity[];

    @OneToMany(() => JumpointNodeEntity, (jumpointNode) => jumpointNode.jumpoint)
    public jumpointNodes?: JumpointNodeEntity[];

    public static create(
        id: number,
        name: string,
        platformType: JumpointPlatformType,
        codeName?: string,
        comments?: string,
        isEnabled?: boolean,
        isConnected?: boolean,
        isClustered?: boolean,
        isShellJumpEnabled?: boolean,
        externalJumpItemNetworkId?: string,
        isProtocolTunnelEnabled?: boolean,
        rdpServiceAccountId?: number | null,
        managedIpRanges?: JumpointIpRange[],
        isJzpEnabled?: boolean,
        jzpProxyHostname?: string,
        jzpProxyPort?: number,
        isJzpHttpGetAllowed?: boolean,
        jzpClientAddressRestrictionsType?: JzpClientAddressRestrictionsType,
        jzpRestrictedIps?: string[],
        dockerDeployKey?: string,
        keyInfo?: string,
    ): JumpointEntity {
        const entity = new JumpointEntity();
        entity.id = id;
        entity.name = name;
        entity.platformType = platformType;
        entity.codeName = codeName;
        entity.comments = comments;
        entity.isEnabled = isEnabled;
        entity.isConnected = isConnected;
        entity.isClustered = isClustered;
        entity.isShellJumpEnabled = isShellJumpEnabled;
        entity.externalJumpItemNetworkId = externalJumpItemNetworkId;
        entity.isProtocolTunnelEnabled = isProtocolTunnelEnabled;
        entity.rdpServiceAccountId = rdpServiceAccountId;
        entity.managedIpRanges = managedIpRanges;
        entity.isJzpEnabled = isJzpEnabled;
        entity.jzpProxyHostname = jzpProxyHostname;
        entity.jzpProxyPort = jzpProxyPort;
        entity.isJzpHttpGetAllowed = isJzpHttpGetAllowed;
        entity.jzpClientAddressRestrictionsType = jzpClientAddressRestrictionsType;
        entity.jzpRestrictedIps = jzpRestrictedIps;
        entity.dockerDeployKey = dockerDeployKey;
        entity.keyInfo = keyInfo;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
