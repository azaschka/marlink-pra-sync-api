import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { UuidUtility } from '../../shared/utilities';
import { AddUserToTeamCommand, RemoveUserFromTeamCommand } from '../commands';
import { AddUserToTeamDtoInput } from '../dtos/inputs';
import { TeamUserAddedDtoOutput } from '../dtos/outputs';
import { TeamUser } from '../models';

@ApiBearerAuth()
@ApiTags('Teams')
@Controller('teams')
@UsePipes(new ValidationPipe({ transform: true }))
export class TeamUsersController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post(':id/users')
    @ApiParam({ name: 'id', type: Number, required: true })
    @ApiOkResponse({ type: TeamUserAddedDtoOutput })
    public async addUserToTeam(
        @Param('id') id: number,
        @Body() dtoInput: AddUserToTeamDtoInput,
    ): Promise<TeamUserAddedDtoOutput> {
        const result = await this.commandBus.execute<AddUserToTeamCommand, TeamUser>(
            new AddUserToTeamCommand(UuidUtility.generate(), id, dtoInput.userId, dtoInput.roleType),
        );

        return result;
    }

    @Delete(':id/users/:userId')
    @ApiParam({ name: 'id', type: Number, required: true })
    @ApiParam({ name: 'userId', type: Number, required: true })
    @HttpCode(HttpStatus.NO_CONTENT)
    public async removeUserFromTeam(@Param('id') id: number, @Param('userId') userId: number): Promise<void> {
        await this.commandBus.execute(new RemoveUserFromTeamCommand(UuidUtility.generate(), id, userId));
    }
}
