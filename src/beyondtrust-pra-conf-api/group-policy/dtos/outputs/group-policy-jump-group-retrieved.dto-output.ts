import { Expose } from 'class-transformer';

export class GroupPolicyJumpGroupRetrievedDtoOutput {
    @Expose({ name: 'jump_group_id' })
    public jumpGroupId!: number;

    @Expose({ name: 'jump_item_role_id' })
    public jumpItemRoleId?: number;

    @Expose({ name: 'jump_policy_id' })
    public jumpPolicyId?: number;
}
