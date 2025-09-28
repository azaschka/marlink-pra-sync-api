import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { JumpGroupEntity } from '../../../../jump-group/repositories/entities';
import { JumpPolicyEntity } from '../../../../jump-policy/repositories/entities';
import { JumpointEntity } from '../../../../jumpoint/repositories/entities';
import { DateUtility } from '../../../../shared/utilities';
import { JumpGroupType } from '../../enums';
import { RemoteVnc } from '../../models';

@Entity({ name: 'jump_item_remote_vncs' })
export class RemoteVncEntity implements RemoteVnc {
    @Column({ name: 'id', type: 'int', unique: true, primary: true, generated: false })
    public id!: number;

    @Column({ name: 'name', type: 'varchar' })
    public name!: string;

    @Column({ name: 'jumpoint_id', type: 'int' })
    public jumpointId!: number;

    @Column({ name: 'hostname', type: 'varchar' })
    public hostname!: string;

    @Column({ name: 'port', type: 'int', nullable: true })
    public port?: number;

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

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    @ManyToOne(() => JumpointEntity, (jumpoint) => jumpoint.remoteVncs, {
        onDelete: 'CASCADE',
        eager: true,
    })
    @JoinColumn({ name: 'jumpoint_id' })
    public jumpoint?: JumpointEntity;

    @ManyToOne(() => JumpGroupEntity, (jumpGroup) => jumpGroup.remoteVncs, {
        onDelete: 'CASCADE',
        eager: true,
    })
    @JoinColumn({ name: 'jump_group_id' })
    public jumpGroup?: JumpGroupEntity;

    @ManyToOne(() => JumpPolicyEntity, (jumpPolicy) => jumpPolicy.remoteVncs, {
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
        port: number | undefined,
        jumpGroupId: number,
        jumpGroupType?: JumpGroupType,
        tag?: string,
        comments?: string,
        jumpPolicyId?: number | null,
        sessionPolicyId?: number | null,
    ): RemoteVncEntity {
        const entity = new RemoteVncEntity();
        entity.id = id;
        entity.name = name;
        entity.jumpointId = jumpointId;
        entity.hostname = hostname;
        entity.port = port;
        entity.jumpGroupId = jumpGroupId;
        entity.jumpGroupType = jumpGroupType;
        entity.tag = tag;
        entity.comments = comments;
        entity.jumpPolicyId = jumpPolicyId;
        entity.sessionPolicyId = sessionPolicyId;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
