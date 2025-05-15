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
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
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
    @ApiCreatedResponse({ type: TeamCreatedDtoOutput })
    public async createTeam(@Body() dtoInput: CreateTeamDtoInput): Promise<TeamCreatedDtoOutput> {
        const result = await this.commandBus.execute<CreateTeamCommand, Team>(
            new CreateTeamCommand(UuidUtility.generate(), dtoInput.name, dtoInput.codeName, dtoInput.comments),
        );

        return result;
    }

    @Patch(':id')
    @ApiOkResponse({ type: TeamModifiedDtoOutput })
    public async modifyTeam(
        @Query('id') id: number,
        @Body() dtoInput: ModifyTeamDtoInput,
    ): Promise<TeamModifiedDtoOutput> {
        const result = await this.commandBus.execute<ModifyTeamCommand, Team>(
            new ModifyTeamCommand(UuidUtility.generate(), id, dtoInput.name, dtoInput.codeName, dtoInput.comments),
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
