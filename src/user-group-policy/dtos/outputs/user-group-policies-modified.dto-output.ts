import { ApiProperty } from '@nestjs/swagger';
import { UserGroupPolicies } from '../../models';

export class UserGroupPoliciesModifiedDtoOutput implements UserGroupPolicies {
    @ApiProperty({ required: true, type: Number })
    public userId!: number;

    @ApiProperty({ required: true, type: [Number] })
    public groupPolicyIds!: number[];
}
