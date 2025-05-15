import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { UuidUtility } from '../../shared/utilities';
import { CreateTeamCommand, DeleteTeamCommand, UpdateTeamCommand } from '../commands';
import { CreateTeamDtoInput, RetrieveTeamsDtoInput, UpdateTeamDtoInput } from '../dtos/inputs';
import { TeamCreatedDtoOutput, TeamRetrievedDtoOutput, TeamUpdatedDtoOutput } from '../dtos/outputs';
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
    @ApiCreatedResponse({ type: TeamCreatedDtoOutput })
    public async createTeam(@Body() dtoInput: CreateTeamDtoInput): Promise<TeamCreatedDtoOutput> {
        const result = await this.commandBus.execute<CreateTeamCommand, Team>(
            new CreateTeamCommand(UuidUtility.generate(), dtoInput.name, dtoInput.codeName, dtoInput.comments),
        );

        return result;
    }

    @Put(':id')
    @ApiOkResponse({ type: TeamUpdatedDtoOutput })
    public async updateTeam(
        @Query('id') id: number,
        @Body() dtoInput: UpdateTeamDtoInput,
    ): Promise<TeamUpdatedDtoOutput> {
        const result = await this.commandBus.execute<UpdateTeamCommand, Team>(
            new UpdateTeamCommand(UuidUtility.generate(), id, dtoInput.name, dtoInput.codeName, dtoInput.comments),
        );

        return result;
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, required: true })
    @HttpCode(HttpStatus.NO_CONTENT)
    public async deleteTeam(@Param('id') id: number): Promise<void> {
        await this.commandBus.execute<DeleteTeamCommand, void>(new DeleteTeamCommand(UuidUtility.generate(), id));
    }
}
