import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { JumpGroupEntity } from '../../../jump-group/repositories/entities';
import { JumpPolicyEntity } from '../../../jump-policy/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import {
    JumpClientConnectionType,
    JumpClientEndpointAgreementPolicyType,
    JumpClientGroupType,
    JumpClientInstallMode,
    JumpClientUnavailableReasonType,
} from '../../enums';
import { JumpClient } from '../../models';

@Entity({ name: 'jump_clients' })
export class JumpClientEntity implements JumpClient {
    @Column({ name: 'id', type: 'int', unique: true, primary: true, generated: false })
    public id!: number;

    @Column({ name: 'jump_group_id', type: 'int' })
    public jumpGroupId!: number;

    @Column({ name: 'jump_group_type', type: 'enum', enum: JumpClientGroupType, nullable: true })
    public jumpGroupType?: JumpClientGroupType;

    @Column({ name: 'name', type: 'varchar', nullable: true })
    public name?: string;

    @Column({ name: 'hostname', type: 'varchar', nullable: true })
    public hostname?: string;

    @Column({ name: 'fqdn', type: 'varchar', nullable: true })
    public fqdn?: string;

    @Column({ name: 'tag', type: 'varchar', nullable: true })
    public tag?: string;

    @Column({ name: 'comments', type: 'text', nullable: true })
    public comments?: string;

    @Column({ name: 'jump_policy_id', type: 'int', nullable: true })
    public jumpPolicyId?: number | null;

    @Column({ name: 'session_policy_id', type: 'int', nullable: true })
    public sessionPolicyId?: number | null;

    @Column({ name: 'install_mode', type: 'enum', enum: JumpClientInstallMode, nullable: true })
    public installMode?: JumpClientInstallMode;

    @Column({ name: 'connection_type', type: 'enum', enum: JumpClientConnectionType, nullable: true })
    public connectionType?: JumpClientConnectionType;

    @Column({ name: 'last_connect_date', type: 'timestamp', nullable: true })
    public lastConnectDate?: Date;

    @Column({ name: 'last_disconnect_date', type: 'timestamp', nullable: true })
    public lastDisconnectDate?: Date;

    @Column({ name: 'is_lost', type: 'boolean', nullable: true })
    public isLost?: boolean;

    @Column({ name: 'needs_update', type: 'boolean', nullable: true })
    public needsUpdate?: boolean;

    @Column({ name: 'unavailable_reason_type', type: 'enum', enum: JumpClientUnavailableReasonType, nullable: true })
    public unavailableReasonType?: JumpClientUnavailableReasonType;

    @Column({ name: 'operating_system', type: 'varchar', nullable: true })
    public operatingSystem?: string;

    @Column({ name: 'public_ip', type: 'varchar', nullable: true })
    public publicIp?: string;

    @Column({ name: 'private_ip', type: 'varchar', nullable: true })
    public privateIp?: string;

    @Column({ name: 'console_user', type: 'varchar', nullable: true })
    public consoleUser?: string;

    @Column({ name: 'expiration_date', type: 'timestamp', nullable: true })
    public expirationDate?: Date;

    @Column({ name: 'max_offline_duration_in_minutes', type: 'int', nullable: true })
    public maxOfflineDurationInMinutes?: number;

    @Column({ name: 'last_access_date', type: 'timestamp', nullable: true })
    public lastAccessDate?: Date;

    @Column({
        name: 'endpoint_agreement_policy_type',
        type: 'enum',
        enum: JumpClientEndpointAgreementPolicyType,
        nullable: true,
    })
    public endpointAgreementPolicyType?: JumpClientEndpointAgreementPolicyType;

    @Column({ name: 'jumpoint_proxy', type: 'varchar', nullable: true })
    public jumpointProxy?: string | null;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    @ManyToOne(() => JumpGroupEntity, (jumpGroup) => jumpGroup.jumpClients, {
        onDelete: 'CASCADE',
        eager: true,
    })
    @JoinColumn({ name: 'jump_group_id' })
    public jumpGroup!: JumpGroupEntity;

    @ManyToOne(() => JumpPolicyEntity, (jumpPolicy) => jumpPolicy.jumpClients, {
        onDelete: 'SET NULL',
        eager: true,
    })
    @JoinColumn({ name: 'jump_policy_id' })
    public jumpPolicy?: JumpPolicyEntity;

    public static create(
        id: number,
        jumpGroupId: number,
        jumpGroupType?: JumpClientGroupType,
        name?: string,
        hostname?: string,
        fqdn?: string,
        tag?: string,
        comments?: string,
        jumpPolicyId?: number | null,
        sessionPolicyId?: number | null,
        installMode?: JumpClientInstallMode,
        connectionType?: JumpClientConnectionType,
        lastConnectDate?: Date,
        lastDisconnectDate?: Date,
        isLost?: boolean,
        needsUpdate?: boolean,
        unavailableReasonType?: JumpClientUnavailableReasonType,
        operatingSystem?: string,
        publicIp?: string,
        privateIp?: string,
        consoleUser?: string,
        expirationDate?: Date,
        maxOfflineDurationInMinutes?: number,
        lastAccessDate?: Date,
        endpointAgreementPolicyType?: JumpClientEndpointAgreementPolicyType,
        jumpointProxy?: string | null,
    ) {
        const entity = new JumpClientEntity();
        entity.id = id;
        entity.jumpGroupId = jumpGroupId;
        entity.jumpGroupType = jumpGroupType;
        entity.name = name;
        entity.hostname = hostname;
        entity.fqdn = fqdn;
        entity.tag = tag;
        entity.comments = comments;
        entity.jumpPolicyId = jumpPolicyId;
        entity.sessionPolicyId = sessionPolicyId;
        entity.installMode = installMode;
        entity.connectionType = connectionType;
        entity.lastConnectDate = lastConnectDate;
        entity.lastDisconnectDate = lastDisconnectDate;
        entity.isLost = isLost;
        entity.needsUpdate = needsUpdate;
        entity.unavailableReasonType = unavailableReasonType;
        entity.operatingSystem = operatingSystem;
        entity.publicIp = publicIp;
        entity.privateIp = privateIp;
        entity.consoleUser = consoleUser;
        entity.expirationDate = expirationDate;
        entity.maxOfflineDurationInMinutes = maxOfflineDurationInMinutes;
        entity.lastAccessDate = lastAccessDate;
        entity.endpointAgreementPolicyType = endpointAgreementPolicyType;
        entity.jumpointProxy = jumpointProxy;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
