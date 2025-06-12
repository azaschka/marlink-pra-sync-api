import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { JumpointEntity } from '../../../jumpoint/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { GroupPolicyJumpoint } from '../../models';

@Entity({ name: 'group_policy_jumpoints' })
export class GroupPolicyJumpointEntity implements GroupPolicyJumpoint {
    @PrimaryColumn({ name: 'group_policy_id', type: 'int' })
    public groupPolicyId!: number;

    @PrimaryColumn({ name: 'jumpoint_id', type: 'int' })
    public jumpointId!: number;

    @ManyToOne(() => GroupPolicyEntity, (groupPolicy) => groupPolicy.groupPolicyJumpoints)
    @JoinColumn({ name: 'group_policy_id' })
    public groupPolicy!: GroupPolicyEntity;

    @ManyToOne(() => JumpointEntity, (jumpoint) => jumpoint.groupPolicyJumpoints)
    @JoinColumn({ name: 'jumpoint_id' })
    public jumpoint!: JumpointEntity;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    public static create(groupPolicyId: number, jumpointId: number): GroupPolicyJumpointEntity {
        const entity = new GroupPolicyJumpointEntity();
        entity.groupPolicyId = groupPolicyId;
        entity.jumpointId = jumpointId;
        entity.groupPolicy = { id: groupPolicyId } as GroupPolicyEntity; // Stub GroupPolicyEntity with only the id
        entity.jumpoint = { id: jumpointId } as JumpointEntity; // Stub JumpointEntity with only the id
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
