import { Column, Entity } from 'typeorm';
import { DateUtility } from '../../../shared/utilities';
import { JumpClientConnectionType, JumpClientGroupType } from '../../enums';
import { JumpClientInstaller, JumpClientInstallerKeyInfo } from '../../models';

@Entity({ name: 'jump_client_installers' })
export class JumpClientInstallerEntity implements JumpClientInstaller {
    @Column({ name: 'id', type: 'int', unique: true, primary: true, generated: false })
    public id!: number;

    @Column({ name: 'jump_group_id', type: 'int' })
    public jumpGroupId!: number;

    @Column({ name: 'jump_group_type', type: 'enum', enum: JumpClientGroupType, nullable: true })
    public jumpGroupType?: JumpClientGroupType;

    @Column({ name: 'name', type: 'varchar', nullable: true })
    public name?: string;

    @Column({ name: 'tag', type: 'varchar', nullable: true })
    public tag?: string;

    @Column({ name: 'comments', type: 'text', nullable: true })
    public comments?: string;

    @Column({ name: 'jump_policy_id', type: 'int', nullable: true })
    public jumpPolicyId?: number;

    @Column({ name: 'session_policy_id', type: 'int', nullable: true })
    public sessionPolicyId?: number | null;

    @Column({ name: 'connection_type', type: 'enum', enum: JumpClientConnectionType, nullable: true })
    public connectionType?: JumpClientConnectionType;

    @Column({ name: 'expiration_date', type: 'timestamp', nullable: true })
    public expirationDate?: Date;

    @Column({ name: 'max_offline_duration_in_minutes', type: 'int', nullable: true })
    public maxOfflineDurationInMinutes?: number;

    @Column({ name: 'should_elevate_install', type: 'boolean', nullable: true })
    public shouldElevateInstall?: boolean;

    @Column({ name: 'should_elevate_prompt', type: 'boolean', nullable: true })
    public shouldElevatePrompt?: boolean;

    @Column({ name: 'can_override_jump_group', type: 'boolean', nullable: true })
    public canOverrideJumpGroup?: boolean;

    @Column({ name: 'can_override_jump_policy', type: 'boolean', nullable: true })
    public canOverrideJumpPolicy?: boolean;

    @Column({ name: 'can_override_name', type: 'boolean', nullable: true })
    public canOverrideName?: boolean;

    @Column({ name: 'can_override_tag', type: 'boolean', nullable: true })
    public canOverrideTag?: boolean;

    @Column({ name: 'can_override_comments', type: 'boolean', nullable: true })
    public canOverrideComments?: boolean;

    @Column({ name: 'can_override_session_policy', type: 'boolean', nullable: true })
    public canOverrideSessionPolicy?: boolean;

    @Column({ name: 'installer_id', type: 'varchar', nullable: true })
    public installerId?: string;

    @Column({ name: 'key_info', type: 'json', nullable: true })
    public keyInfo?: JumpClientInstallerKeyInfo[];

    @Column({ name: 'jumpoint_proxy', type: 'varchar', nullable: true })
    public jumpointProxy?: string | null;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    public static create(
        id: number,
        jumpGroupId: number,
        jumpGroupType?: JumpClientGroupType,
        name?: string,
        tag?: string,
        comments?: string,
        jumpPolicyId?: number,
        sessionPolicyId?: number | null,
        connectionType?: JumpClientConnectionType,
        expirationDate?: Date,
        maxOfflineDurationInMinutes?: number,
        shouldElevateInstall?: boolean,
        shouldElevatePrompt?: boolean,
        canOverrideJumpGroup?: boolean,
        canOverrideJumpPolicy?: boolean,
        canOverrideName?: boolean,
        canOverrideTag?: boolean,
        canOverrideComments?: boolean,
        canOverrideSessionPolicy?: boolean,
        installerId?: string,
        keyInfo?: JumpClientInstallerKeyInfo[],
        jumpointProxy?: string | null,
    ) {
        const entity = new JumpClientInstallerEntity();
        entity.id = id;
        entity.jumpGroupId = jumpGroupId;
        entity.jumpGroupType = jumpGroupType;
        entity.name = name;
        entity.tag = tag;
        entity.comments = comments;
        entity.jumpPolicyId = jumpPolicyId;
        entity.sessionPolicyId = sessionPolicyId;
        entity.connectionType = connectionType;
        entity.expirationDate = expirationDate;
        entity.maxOfflineDurationInMinutes = maxOfflineDurationInMinutes;
        entity.shouldElevateInstall = shouldElevateInstall;
        entity.shouldElevatePrompt = shouldElevatePrompt;
        entity.canOverrideJumpGroup = canOverrideJumpGroup;
        entity.canOverrideJumpPolicy = canOverrideJumpPolicy;
        entity.canOverrideName = canOverrideName;
        entity.canOverrideTag = canOverrideTag;
        entity.canOverrideComments = canOverrideComments;
        entity.canOverrideSessionPolicy = canOverrideSessionPolicy;
        entity.installerId = installerId;
        entity.keyInfo = keyInfo;
        entity.jumpointProxy = jumpointProxy;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
