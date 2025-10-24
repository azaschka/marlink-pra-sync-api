import { GroupPolicyJumpGroupRetrievedDtoOutput as BTGroupPolicyJumpGroup } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { JumpGroupEntity } from '../../../jump-group/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { GroupPolicyJumpGroup } from '../../models';

export class GroupPolicyJumpGroupEntity implements GroupPolicyJumpGroup {
    public groupPolicyId!: number;
    public jumpGroupId!: number;
    public jumpItemRoleId?: number;
    public jumpPolicyId?: number;
    public groupPolicy?: GroupPolicyEntity;
    public jumpGroup?: JumpGroupEntity;
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

    public static createFromBT(groupPolicyId: number, btGroupPolicyJumpGroup: BTGroupPolicyJumpGroup) {
        return GroupPolicyJumpGroupEntity.create(
            groupPolicyId,
            btGroupPolicyJumpGroup.jumpGroupId,
            btGroupPolicyJumpGroup.jumpItemRoleId,
            btGroupPolicyJumpGroup.jumpPolicyId,
        );
    }
}
