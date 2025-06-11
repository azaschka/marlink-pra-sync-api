import { ApiProperty } from '@nestjs/swagger';
import { UserTeamRoleType } from '../../enums';
import { TeamMembership } from '../../models';

export class TeamMembershipDtoOutput implements TeamMembership {
    @ApiProperty({ required: true, type: Number })
    public userId!: number;

    @ApiProperty({ required: true, enum: UserTeamRoleType })
    public roleType!: UserTeamRoleType;
}
