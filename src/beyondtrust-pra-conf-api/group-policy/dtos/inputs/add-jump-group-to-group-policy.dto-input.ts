import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class AddJumpGroupToGroupPolicyDtoInput {
    @Expose({ name: 'jump_group_id' })
    @IsInt()
    @IsNotEmpty()
    public jumpGroupId!: number;

    @Expose({ name: 'jump_item_role_id' })
    @IsInt()
    @IsOptional()
    public jumpItemRoleId?: number;

    @Expose({ name: 'jump_policy_id' })
    @IsInt()
    @IsOptional()
    public jumpPolicyId?: number;

    public static create(
        jumpGroupId: number,
        jumpItemRoleId?: number,
        jumpPolicyId?: number,
    ): AddJumpGroupToGroupPolicyDtoInput {
        const dto = new AddJumpGroupToGroupPolicyDtoInput();
        dto.jumpGroupId = jumpGroupId;
        dto.jumpItemRoleId = jumpItemRoleId;
        dto.jumpPolicyId = jumpPolicyId;

        return dto;
    }
}
