import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { JumpGroupEntity } from '../../../../jump-group/repositories/entities';
import { JumpPolicyEntity } from '../../../../jump-policy/repositories/entities';
import { JumpointEntity } from '../../../../jumpoint/repositories/entities';
import { DateUtility } from '../../../../shared/utilities';
import { JumpGroupType, ShellJumpProtocolType, ShellJumpTerminalType } from '../../enums';
import { ShellJump } from '../../models';

@Entity({ name: 'jump_item_shell_jumps' })
export class ShellJumpEntity implements ShellJump {
    @Column({ name: 'id', type: 'int', unique: true, primary: true, generated: false })
    public id!: number;

    @Column({ name: 'name', type: 'varchar' })
    public name!: string;

    @Column({ name: 'jumpoint_id', type: 'int' })
    public jumpointId!: number;

    @Column({ name: 'hostname', type: 'varchar' })
    public hostname!: string;

    @Column({ name: 'protocol_type', type: 'enum', enum: ShellJumpProtocolType })
    public protocolType!: ShellJumpProtocolType;

    @Column({ name: 'port', type: 'int', nullable: true })
    public port?: number;

    @Column({ name: 'jump_group_id', type: 'int' })
    public jumpGroupId!: number;

    @Column({ name: 'jump_group_type', type: 'enum', enum: JumpGroupType, nullable: true })
    public jumpGroupType?: JumpGroupType;

    @Column({ name: 'terminal_type', type: 'enum', enum: ShellJumpTerminalType, nullable: true })
    public terminalType?: ShellJumpTerminalType;

    @Column({ name: 'keep_alive_idle_session_in_seconds', type: 'int', nullable: true })
    public keepAliveIdleSessionInSeconds?: number;

    @Column({ name: 'tag', type: 'varchar', nullable: true })
    public tag?: string;

    @Column({ name: 'comments', type: 'text', nullable: true })
    public comments?: string;

    @Column({ name: 'jump_policy_id', type: 'int', nullable: true })
    public jumpPolicyId?: number | null;

    @Column({ name: 'username', type: 'varchar', nullable: true })
    public username?: string;

    @Column({ name: 'session_policy_id', type: 'int', nullable: true })
    public sessionPolicyId?: number | null;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    @ManyToOne(() => JumpointEntity, (jumpoint) => jumpoint.shellJumps, {
        onDelete: 'CASCADE',
        eager: true,
    })
    @JoinColumn({ name: 'jumpoint_id' })
    public jumpoint!: JumpointEntity;

    @ManyToOne(() => JumpGroupEntity, (jumpGroup) => jumpGroup.shellJumps, {
        onDelete: 'CASCADE',
        eager: true,
    })
    @JoinColumn({ name: 'jump_group_id' })
    public jumpGroup!: JumpGroupEntity;

    @ManyToOne(() => JumpPolicyEntity, (jumpPolicy) => jumpPolicy.shellJumps, {
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
        protocolType: ShellJumpProtocolType,
        port: number | undefined,
        jumpGroupId: number,
        jumpGroupType?: JumpGroupType,
        terminalType?: ShellJumpTerminalType,
        keepAliveIdleSessionInSeconds?: number,
        tag?: string,
        comments?: string,
        jumpPolicyId?: number | null,
        username?: string,
        sessionPolicyId?: number | null,
    ): ShellJumpEntity {
        const entity = new ShellJumpEntity();
        entity.id = id;
        entity.name = name;
        entity.jumpointId = jumpointId;
        entity.hostname = hostname;
        entity.protocolType = protocolType;
        entity.port = port;
        entity.jumpGroupId = jumpGroupId;
        entity.jumpGroupType = jumpGroupType;
        entity.terminalType = terminalType;
        entity.keepAliveIdleSessionInSeconds = keepAliveIdleSessionInSeconds;
        entity.tag = tag;
        entity.comments = comments;
        entity.jumpPolicyId = jumpPolicyId;
        entity.username = username;
        entity.sessionPolicyId = sessionPolicyId;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
