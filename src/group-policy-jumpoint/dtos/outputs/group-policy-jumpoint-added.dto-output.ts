import { ApiProperty } from '@nestjs/swagger';
import { GroupPolicyJumpoint } from '../../models';

export class GroupPolicyJumpointAddedDtoOutput implements GroupPolicyJumpoint {
    @ApiProperty({ required: true, type: Number })
    public groupPolicyId!: number;

    @ApiProperty({ required: true, type: Number })
    public jumpointId!: number;
}
