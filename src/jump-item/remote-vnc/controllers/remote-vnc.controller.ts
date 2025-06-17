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
import { NonEmptyBodyPipe } from '../../../shared/pipes';
import { UuidUtility } from '../../../shared/utilities';
import {
    CopyRemoteVncCommand,
    CreateRemoteVncCommand,
    DeleteRemoteVncCommand,
    ModifyRemoteVncCommand,
} from '../commands';
import {
    CopyRemoteVncDtoInput,
    CreateRemoteVncDtoInput,
    ModifyRemoteVncDtoInput,
    RetrieveRemoteVncsDtoInput,
} from '../dtos/inputs';
import {
    RemoteVncCopiedDtoOutput,
    RemoteVncCreatedDtoOutput,
    RemoteVncModifiedDtoOutput,
    RemoteVncRetrievedDtoOutput,
} from '../dtos/outputs';
import { RemoteVnc } from '../models';
import { RetrieveRemoteVncsQuery } from '../queries';

@ApiBearerAuth()
@ApiTags('Jump Items')
@Controller('jump-items/remote-vncs')
@UsePipes(new ValidationPipe({ transform: true }))
export class RemoteVncController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get()
    @ApiOkResponse({ type: RemoteVncRetrievedDtoOutput, isArray: true })
    public async retrieveRemoteVncs(
        @Query() dtoInput: RetrieveRemoteVncsDtoInput,
    ): Promise<RemoteVncRetrievedDtoOutput[]> {
        const result = await this.queryBus.execute<RetrieveRemoteVncsQuery, RemoteVnc[]>(
            new RetrieveRemoteVncsQuery(
                UuidUtility.generate(),
                dtoInput.pageSize,
                dtoInput.pageNumber,
                dtoInput.name,
                dtoInput.hostname,
                dtoInput.jumpGroupId,
                dtoInput.jumpGroupType,
                dtoInput.jumpointId,
                dtoInput.tag,
            ),
        );

        return result;
    }

    @Post()
    @ApiCreatedResponse({ type: RemoteVncCreatedDtoOutput })
    public async createRemoteVnc(@Body() dtoInput: CreateRemoteVncDtoInput): Promise<RemoteVncCreatedDtoOutput> {
        const result = await this.commandBus.execute<CreateRemoteVncCommand, RemoteVnc>(
            new CreateRemoteVncCommand(
                UuidUtility.generate(),
                dtoInput.name,
                dtoInput.jumpointId,
                dtoInput.hostname,
                dtoInput.port,
                dtoInput.jumpGroupId,
                dtoInput.jumpGroupType,
                dtoInput.tag,
                dtoInput.comments,
                dtoInput.jumpPolicyId,
                dtoInput.sessionPolicyId,
            ),
        );

        return result;
    }

    @Patch(':id')
    @ApiOkResponse({ type: RemoteVncModifiedDtoOutput })
    public async modifyRemoteVnc(
        @Param('id') id: number,
        @Body(new NonEmptyBodyPipe()) dtoInput: ModifyRemoteVncDtoInput,
    ): Promise<RemoteVncModifiedDtoOutput> {
        const result = await this.commandBus.execute<ModifyRemoteVncCommand, RemoteVnc>(
            new ModifyRemoteVncCommand(
                UuidUtility.generate(),
                id,
                dtoInput.name,
                dtoInput.jumpointId,
                dtoInput.hostname,
                dtoInput.port,
                dtoInput.jumpGroupId,
                dtoInput.jumpGroupType,
                dtoInput.tag,
                dtoInput.comments,
                dtoInput.jumpPolicyId,
                dtoInput.sessionPolicyId,
            ),
        );

        return result;
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, required: true })
    @HttpCode(HttpStatus.NO_CONTENT)
    public async deleteRemoteVnc(@Param('id') id: number): Promise<void> {
        await this.commandBus.execute<DeleteRemoteVncCommand, void>(
            new DeleteRemoteVncCommand(UuidUtility.generate(), id),
        );
    }

    @Post(':id/copy')
    @ApiParam({ name: 'id', type: Number, required: true })
    @ApiOkResponse({ type: RemoteVncCopiedDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async copyRemoteVnc(
        @Param('id') id: number,
        @Body() dtoInput: CopyRemoteVncDtoInput,
    ): Promise<RemoteVncCopiedDtoOutput> {
        const result = await this.commandBus.execute<CopyRemoteVncCommand, RemoteVnc>(
            new CopyRemoteVncCommand(
                UuidUtility.generate(),
                id,
                dtoInput.jumpGroupId,
                dtoInput.jumpGroupType,
                dtoInput.name,
            ),
        );

        return result;
    }
}
