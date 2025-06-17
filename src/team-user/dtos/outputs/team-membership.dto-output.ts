import { ApiProperty } from '@nestjs/swagger';
import { UserTeamRoleType } from '../../enums';
import { TeamMembership } from '../../models';

export class TeamMembershipDtoOutput implements TeamMembership {
    @ApiProperty({
        required: true,
        type: Number,
        description: 'The unique identifier of the user who has access to the team.',
    })
    public userId!: number;

    @ApiProperty({ required: true, enum: UserTeamRoleType })
    public roleType!: UserTeamRoleType;
}
