import { ApiProperty } from '@nestjs/swagger';
import { UserGroupPolicies } from '../../models';

export class UserGroupPoliciesModifiedDtoOutput implements UserGroupPolicies {
    @ApiProperty({ required: true, type: Number, description: 'The unique identifier for the user.' })
    public userId!: number;

    @ApiProperty({
        required: true,
        type: [Number],
        description: 'The unique identifier for the group policies.',
    })
    public groupPolicyIds!: number[];
}
