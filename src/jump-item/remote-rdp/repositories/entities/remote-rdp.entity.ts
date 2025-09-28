import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { JumpGroupEntity } from '../../../../jump-group/repositories/entities';
import { JumpPolicyEntity } from '../../../../jump-policy/repositories/entities';
import { JumpointEntity } from '../../../../jumpoint/repositories/entities';
import { DateUtility } from '../../../../shared/utilities';
import { JumpGroupType, RdpQualityMode, SecureAppType } from '../../enums';
import { RemoteRdp } from '../../models';

@Entity({ name: 'jump_item_remote_rdps' })
export class RemoteRdpEntity implements RemoteRdp {
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

    @Column({ name: 'quality_mode', type: 'enum', enum: RdpQualityMode, nullable: true })
    public qualityMode?: RdpQualityMode;

    @Column({ name: 'must_start_new_console_session', type: 'boolean', nullable: true })
    public mustStartNewConsoleSession?: boolean;

    @Column({ name: 'must_ignore_untrusted_server_cert', type: 'boolean', nullable: true })
    public mustIgnoreUntrustedServerCert?: boolean;

    @Column({ name: 'tag', type: 'varchar', nullable: true })
    public tag?: string;

    @Column({ name: 'comments', type: 'text', nullable: true })
    public comments?: string;

    @Column({ name: 'rdp_username', type: 'varchar', nullable: true })
    public rdpUsername?: string;

    @Column({ name: 'domain', type: 'varchar', nullable: true })
    public domain?: string;

    @Column({ name: 'jump_policy_id', type: 'int', nullable: true })
    public jumpPolicyId?: number | null;

    @Column({ name: 'is_session_forensics_enabled', type: 'boolean', nullable: true })
    public isSessionForensicsEnabled?: boolean;

    @Column({ name: 'session_policy_id', type: 'int', nullable: true })
    public sessionPolicyId?: number | null;

    @Column({ name: 'endpoint_id', type: 'int', nullable: true })
    public endpointId?: number | null;

    @Column({ name: 'secure_app_type', type: 'enum', enum: SecureAppType, nullable: true })
    public secureAppType?: SecureAppType;

    @Column({ name: 'remote_app_name', type: 'text', nullable: true })
    public remoteAppName?: string;

    @Column({ name: 'remote_app_params', type: 'text', nullable: true })
    public remoteAppParams?: string;

    @Column({ name: 'remote_exe_path', type: 'text', nullable: true })
    public remoteExePath?: string;

    @Column({ name: 'remote_exe_params', type: 'text', nullable: true })
    public remoteExeParams?: string;

    @Column({ name: 'target_system', type: 'varchar', nullable: true })
    public targetSystem?: string;

    @Column({ name: 'credential_type', type: 'varchar', nullable: true })
    public credentialType?: string;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    @ManyToOne(() => JumpointEntity, (jumpoint) => jumpoint.remoteRdps, {
        onDelete: 'CASCADE',
        eager: true,
    })
    @JoinColumn({ name: 'jumpoint_id' })
    public jumpoint?: JumpointEntity;

    @ManyToOne(() => JumpGroupEntity, (jumpGroup) => jumpGroup.remoteRdps, {
        onDelete: 'CASCADE',
        eager: true,
    })
    @JoinColumn({ name: 'jump_group_id' })
    public jumpGroup?: JumpGroupEntity;

    @ManyToOne(() => JumpPolicyEntity, (jumpPolicy) => jumpPolicy.remoteRdps, {
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
        qualityMode?: RdpQualityMode,
        mustStartNewConsoleSession?: boolean,
        mustIgnoreUntrustedServerCert?: boolean,
        tag?: string,
        comments?: string,
        rdpUsername?: string,
        domain?: string,
        jumpPolicyId?: number | null,
        isSessionForensicsEnabled?: boolean,
        sessionPolicyId?: number | null,
        endpointId?: number | null,
        secureAppType?: SecureAppType,
        remoteAppName?: string,
        remoteAppParams?: string,
        remoteExePath?: string,
        remoteExeParams?: string,
        targetSystem?: string,
        credentialType?: string,
    ): RemoteRdpEntity {
        const entity = new RemoteRdpEntity();
        entity.id = id;
        entity.name = name;
        entity.jumpointId = jumpointId;
        entity.hostname = hostname;
        entity.jumpGroupId = jumpGroupId;
        entity.jumpGroupType = jumpGroupType;
        entity.qualityMode = qualityMode;
        entity.mustStartNewConsoleSession = mustStartNewConsoleSession;
        entity.mustIgnoreUntrustedServerCert = mustIgnoreUntrustedServerCert;
        entity.tag = tag;
        entity.comments = comments;
        entity.rdpUsername = rdpUsername;
        entity.domain = domain;
        entity.jumpPolicyId = jumpPolicyId;
        entity.isSessionForensicsEnabled = isSessionForensicsEnabled;
        entity.sessionPolicyId = sessionPolicyId;
        entity.endpointId = endpointId;
        entity.secureAppType = secureAppType;
        entity.remoteAppName = remoteAppName;
        entity.remoteAppParams = remoteAppParams;
        entity.remoteExePath = remoteExePath;
        entity.remoteExeParams = remoteExeParams;
        entity.targetSystem = targetSystem;
        entity.credentialType = credentialType;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
