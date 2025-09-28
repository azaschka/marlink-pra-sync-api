import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { JumpGroupEntity } from '../../../jump-group/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { GroupPolicyJumpGroup } from '../../models';

@Entity({ name: 'group_policy_jump_groups' })
export class GroupPolicyJumpGroupEntity implements GroupPolicyJumpGroup {
    @PrimaryColumn({ name: 'group_policy_id', type: 'int' })
    public groupPolicyId!: number;

    @PrimaryColumn({ name: 'jump_group_id', type: 'int' })
    public jumpGroupId!: number;

    @Column({ name: 'jump_item_role_id', type: 'int', nullable: true })
    public jumpItemRoleId?: number;

    @Column({ name: 'jump_policy_id', type: 'int', nullable: true })
    public jumpPolicyId?: number;

    @ManyToOne(() => GroupPolicyEntity, (groupPolicy) => groupPolicy.groupPolicyJumpGroups, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'group_policy_id' })
    public groupPolicy?: GroupPolicyEntity;

    @ManyToOne(() => JumpGroupEntity, (jumpGroup) => jumpGroup.groupPolicyJumpGroups, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'jump_group_id' })
    public jumpGroup?: JumpGroupEntity;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    public static create(
        groupPolicyId: number,
        jumpGroupId: number,
        jumpItemRoleId?: number,
        jumpPolicyId?: number,
    ): GroupPolicyJumpGroupEntity {
        const entity = new GroupPolicyJumpGroupEntity();
        entity.groupPolicyId = groupPolicyId;
        entity.jumpGroupId = jumpGroupId;
        entity.jumpItemRoleId = jumpItemRoleId;
        entity.jumpPolicyId = jumpPolicyId;
        entity.groupPolicy = { id: groupPolicyId } as GroupPolicyEntity; // Stub GroupPolicyEntity with only the id
        entity.jumpGroup = { id: jumpGroupId } as JumpGroupEntity; // Stub JumpGroupEntity with only the id
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
