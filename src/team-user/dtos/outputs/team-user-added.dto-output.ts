import { ApiProperty } from '@nestjs/swagger';
import { TeamMembership, TeamUser } from '../../models';
import { TeamMembershipDtoOutput } from './team-membership.dto-output';

export class TeamUserAddedDtoOutput implements TeamUser {
    @ApiProperty({
        required: true,
        type: Number,
        description: 'The unique identifier of the team to which this user has access.',
    })
    public teamId!: number;

    @ApiProperty({ required: true, type: TeamMembershipDtoOutput })
    public membership!: TeamMembership;
}
