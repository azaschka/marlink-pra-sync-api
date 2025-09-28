import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { JumpGroupEntity } from '../../../../jump-group/repositories/entities';
import { JumpPolicyEntity } from '../../../../jump-policy/repositories/entities';
import { JumpointEntity } from '../../../../jumpoint/repositories/entities';
import { DateUtility } from '../../../../shared/utilities';
import { JumpGroupType, TunnelType } from '../../enums';
import { ProtocolTunnelJump } from '../../models';

@Entity({ name: 'jump_item_protocol_tunnel_jumps' })
export class ProtocolTunnelJumpEntity implements ProtocolTunnelJump {
    @Column({ name: 'id', type: 'int', unique: true, primary: true, generated: false })
    public id!: number;

    @Column({ name: 'name', type: 'varchar' })
    public name!: string;

    @Column({ name: 'jumpoint_id', type: 'int' })
    public jumpointId!: number;

    @Column({ name: 'hostname', type: 'varchar' })
    public hostname!: string;

    @Column({ name: 'jump_group_id', type: 'int' })
    public jumpGroupId!: number;

    @Column({ name: 'jump_group_type', type: 'enum', enum: JumpGroupType, nullable: true })
    public jumpGroupType?: JumpGroupType;

    @Column({ name: 'tag', type: 'varchar', nullable: true })
    public tag?: string;

    @Column({ name: 'comments', type: 'text', nullable: true })
    public comments?: string;

    @Column({ name: 'jump_policy_id', type: 'int', nullable: true })
    public jumpPolicyId?: number | null;

    @Column({ name: 'session_policy_id', type: 'int', nullable: true })
    public sessionPolicyId?: number | null;

    @Column({ name: 'tunnel_listen_address', type: 'varchar', nullable: true })
    public tunnelListenAddress?: string;

    @Column({ name: 'tunnel_definitions', type: 'text', nullable: true })
    public tunnelDefinitions?: string;

    @Column({ name: 'tunnel_type', type: 'enum', enum: TunnelType, nullable: true })
    public tunnelType?: TunnelType;

    @Column({ name: 'username', type: 'varchar', nullable: true })
    public username?: string;

    @Column({ name: 'database', type: 'varchar', nullable: true })
    public database?: string;

    @Column({ name: 'url', type: 'text', nullable: true })
    public url?: string;

    @Column({ name: 'ca_certificates', type: 'text', nullable: true })
    public caCertificates?: string;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    @ManyToOne(() => JumpointEntity, (jumpoint) => jumpoint.protocolTunnelJumps, {
        onDelete: 'CASCADE',
        eager: true,
    })
    @JoinColumn({ name: 'jumpoint_id' })
    public jumpoint?: JumpointEntity;

    @ManyToOne(() => JumpGroupEntity, (jumpGroup) => jumpGroup.protocolTunnelJumps, {
        onDelete: 'CASCADE',
        eager: true,
    })
    @JoinColumn({ name: 'jump_group_id' })
    public jumpGroup?: JumpGroupEntity;

    @ManyToOne(() => JumpPolicyEntity, (jumpPolicy) => jumpPolicy.protocolTunnelJumps, {
        onDelete: 'SET NULL',
        eager: true,
    })
    @JoinColumn({ name: 'jump_policy_id' })
    public jumpPolicy?: JumpPolicyEntity;

    public static create(
        id: number,
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
    ): ProtocolTunnelJumpEntity {
        const entity = new ProtocolTunnelJumpEntity();
        entity.id = id;
        entity.name = name;
        entity.jumpointId = jumpointId;
        entity.hostname = hostname;
        entity.jumpGroupId = jumpGroupId;
        entity.jumpGroupType = jumpGroupType;
        entity.tag = tag;
        entity.comments = comments;
        entity.jumpPolicyId = jumpPolicyId;
        entity.sessionPolicyId = sessionPolicyId;
        entity.tunnelListenAddress = tunnelListenAddress;
        entity.tunnelDefinitions = tunnelDefinitions;
        entity.tunnelType = tunnelType;
        entity.username = username;
        entity.database = database;
        entity.url = url;
        entity.caCertificates = caCertificates;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
