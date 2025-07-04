import { ApiProperty } from '@nestjs/swagger';
import { GroupPolicyJumpGroup } from '../../models';

export class GroupPolicyJumpGroupAddedDtoOutput implements GroupPolicyJumpGroup {
    @ApiProperty({ required: true, type: Number })
    public groupPolicyId!: number;

    @ApiProperty({ required: true, type: Number })
    public jumpGroupId!: number;

    @ApiProperty({ required: false, type: Number })
    public jumpItemRoleId?: number;

    @ApiProperty({ required: false, type: Number })
    public jumpPolicyId?: number;
}
