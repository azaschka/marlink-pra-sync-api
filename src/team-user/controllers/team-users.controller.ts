import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiParam,
    ApiTags,
    ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
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
    @ApiParam({ name: 'id', type: Number, required: true, description: 'Unique identifier for the resource.' })
    @ApiCreatedResponse({
        type: TeamUserAddedDtoOutput,
        description: 'Indicates the user was successfully added to the team.',
    })
    @ApiUnprocessableEntityResponse({
        description:
            'One or more request parameters are invalid. The body contains a general error message as well as a validation error dictionary.',
    })
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
    @ApiParam({ name: 'id', type: Number, required: true, description: 'Unique identifier for the resource.' })
    @ApiParam({ name: 'userId', type: Number, required: true, description: 'The unique id of the user.' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({
        description: 'Indicates the user was successfully deleted.',
    })
    @ApiNotFoundResponse({
        description: 'The specified resource was not found.',
    })
    public async removeUserFromTeam(@Param('id') id: number, @Param('userId') userId: number): Promise<void> {
        await this.commandBus.execute(new RemoveUserFromTeamCommand(UuidUtility.generate(), id, userId));
    }
}
