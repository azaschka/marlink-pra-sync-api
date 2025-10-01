import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { JumpointEntity } from '../../../jumpoint/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { GroupPolicyJumpoint } from '../../models';

export class GroupPolicyJumpointEntity implements GroupPolicyJumpoint {
    public groupPolicyId!: number;
    public jumpointId!: number;
    public groupPolicy?: GroupPolicyEntity;
    public jumpoint?: JumpointEntity;
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
