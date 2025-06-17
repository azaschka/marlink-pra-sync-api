import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiParam,
    ApiTags,
    ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { NonEmptyBodyPipe } from '../../shared/pipes';
import { UuidUtility } from '../../shared/utilities';
import { CreateTeamCommand, DeleteTeamCommand, ModifyTeamCommand } from '../commands';
import { CreateTeamDtoInput, ModifyTeamDtoInput, RetrieveTeamsDtoInput } from '../dtos/inputs';
import { TeamCreatedDtoOutput, TeamModifiedDtoOutput, TeamRetrievedDtoOutput } from '../dtos/outputs';
import { Team } from '../models';
import { RetrieveTeamsQuery } from '../queries';

@ApiBearerAuth()
@ApiTags('Teams')
@Controller('teams')
@UsePipes(new ValidationPipe({ transform: true }))
export class TeamController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get()
    @ApiOkResponse({ type: TeamRetrievedDtoOutput, isArray: true })
    public async retrieveTeams(@Query() dtoInput: RetrieveTeamsDtoInput): Promise<TeamRetrievedDtoOutput[]> {
        const result = await this.queryBus.execute<RetrieveTeamsQuery, Team[]>(
            new RetrieveTeamsQuery(
                UuidUtility.generate(),
                dtoInput.pageSize,
                dtoInput.pageNumber,
                dtoInput.name,
                dtoInput.codeName,
            ),
        );

        return result;
    }

    @Post()
    @ApiCreatedResponse({
        type: TeamCreatedDtoOutput,
        description: 'Indicates the team was created successfully and contains the new team instance.',
    })
    @ApiUnprocessableEntityResponse({
        description:
            'One or more request parameters are invalid. The body contains a general error message as well as a validation error dictionary.',
    })
    public async createTeam(@Body() dtoInput: CreateTeamDtoInput): Promise<TeamCreatedDtoOutput> {
        const result = await this.commandBus.execute<CreateTeamCommand, Team>(
            new CreateTeamCommand(UuidUtility.generate(), dtoInput.name, dtoInput.codeName, dtoInput.comments),
        );

        return result;
    }

    @Patch(':id')
    @ApiParam({ name: 'id', type: Number, required: true, description: 'Unique identifier for the resource.' })
    @ApiOkResponse({
        type: TeamModifiedDtoOutput,
        description: 'Indicates the team was successfully updated and contains the updated team instance.',
    })
    @ApiNotFoundResponse({ description: 'The specified resource was not found.' })
    @ApiUnprocessableEntityResponse({
        description:
            'One or more request parameters are invalid. The body contains a general error message as well as a validation error dictionary.',
    })
    public async modifyTeam(
        @Param('id') id: number,
        @Body(new NonEmptyBodyPipe()) dtoInput: ModifyTeamDtoInput,
    ): Promise<TeamModifiedDtoOutput> {
        const result = await this.commandBus.execute<ModifyTeamCommand, Team>(
            new ModifyTeamCommand(UuidUtility.generate(), id, dtoInput.name, dtoInput.codeName, dtoInput.comments),
        );

        return result;
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, required: true, description: 'Unique identifier for the resource.' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({ description: 'Indicates the team was successfully deleted.' })
    @ApiNotFoundResponse({ description: 'The specified resource was not found.' })
    @ApiUnprocessableEntityResponse({
        description:
            'One or more request parameters are invalid. The body contains a general error message as well as a validation error dictionary.',
    })
    public async deleteTeam(@Param('id') id: number): Promise<void> {
        await this.commandBus.execute<DeleteTeamCommand, void>(new DeleteTeamCommand(UuidUtility.generate(), id));
    }
}
