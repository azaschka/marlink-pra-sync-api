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
    CopyRemoteRdpCommand,
    CreateRemoteRdpCommand,
    DeleteRemoteRdpCommand,
    ModifyRemoteRdpCommand,
} from '../commands';
import {
    CopyRemoteRdpDtoInput,
    CreateRemoteRdpDtoInput,
    ModifyRemoteRdpDtoInput,
    RetrieveRemoteRdpsDtoInput,
} from '../dtos/inputs';
import {
    RemoteRdpCopiedDtoOutput,
    RemoteRdpCreatedDtoOutput,
    RemoteRdpModifiedDtoOutput,
    RemoteRdpRetrievedDtoOutput,
} from '../dtos/outputs';
import { RemoteRdp } from '../models';
import { RetrieveRemoteRdpsQuery } from '../queries';

@ApiBearerAuth()
@ApiTags('Jump Items')
@Controller('jump-items/remote-rdps')
@UsePipes(new ValidationPipe({ transform: true }))
export class RemoteRdpController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get()
    @ApiOkResponse({ type: RemoteRdpRetrievedDtoOutput, isArray: true })
    public async retrieveRemoteRdps(
        @Query() dtoInput: RetrieveRemoteRdpsDtoInput,
    ): Promise<RemoteRdpRetrievedDtoOutput[]> {
        const result = await this.queryBus.execute<RetrieveRemoteRdpsQuery, RemoteRdp[]>(
            new RetrieveRemoteRdpsQuery(
                UuidUtility.generate(),
                dtoInput.pageSize,
                dtoInput.pageNumber,
                dtoInput.name,
                dtoInput.hostname,
                dtoInput.jumpGroupId,
                dtoInput.jumpGroupType,
                dtoInput.jumpointId,
                dtoInput.endpointId,
                dtoInput.tag,
            ),
        );

        return result;
    }

    @Post()
    @ApiCreatedResponse({ type: RemoteRdpCreatedDtoOutput })
    public async createRemoteRdp(@Body() dtoInput: CreateRemoteRdpDtoInput): Promise<RemoteRdpCreatedDtoOutput> {
        const result = await this.commandBus.execute<CreateRemoteRdpCommand, RemoteRdp>(
            new CreateRemoteRdpCommand(
                UuidUtility.generate(),
                dtoInput.name,
                dtoInput.jumpointId,
                dtoInput.hostname,
                dtoInput.jumpGroupId,
                dtoInput.jumpGroupType,
                dtoInput.qualityMode,
                dtoInput.mustStartNewConsoleSession,
                dtoInput.mustIgnoreUntrustedServerCert,
                dtoInput.tag,
                dtoInput.comments,
                dtoInput.rdpUsername,
                dtoInput.domain,
                dtoInput.jumpPolicyId,
                dtoInput.isSessionForensicsEnabled,
                dtoInput.sessionPolicyId,
                dtoInput.secureAppType,
                dtoInput.remoteAppName,
                dtoInput.remoteAppParams,
                dtoInput.remoteExePath,
                dtoInput.remoteExeParams,
                dtoInput.targetSystem,
                dtoInput.credentialType,
            ),
        );

        return result;
    }

    @Patch(':id')
    @ApiOkResponse({ type: RemoteRdpModifiedDtoOutput })
    public async modifyRemoteRdp(
        @Param('id') id: number,
        @Body(new NonEmptyBodyPipe()) dtoInput: ModifyRemoteRdpDtoInput,
    ): Promise<RemoteRdpModifiedDtoOutput> {
        const result = await this.commandBus.execute<ModifyRemoteRdpCommand, RemoteRdp>(
            new ModifyRemoteRdpCommand(
                UuidUtility.generate(),
                id,
                dtoInput.name,
                dtoInput.jumpointId,
                dtoInput.hostname,
                dtoInput.jumpGroupId,
                dtoInput.jumpGroupType,
                dtoInput.qualityMode,
                dtoInput.mustStartNewConsoleSession,
                dtoInput.mustIgnoreUntrustedServerCert,
                dtoInput.tag,
                dtoInput.comments,
                dtoInput.rdpUsername,
                dtoInput.domain,
                dtoInput.jumpPolicyId,
                dtoInput.isSessionForensicsEnabled,
                dtoInput.sessionPolicyId,
                dtoInput.secureAppType,
                dtoInput.remoteAppName,
                dtoInput.remoteAppParams,
                dtoInput.remoteExePath,
                dtoInput.remoteExeParams,
                dtoInput.targetSystem,
                dtoInput.credentialType,
            ),
        );

        return result;
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, required: true })
    @HttpCode(HttpStatus.NO_CONTENT)
    public async deleteRemoteRdp(@Param('id') id: number): Promise<void> {
        await this.commandBus.execute<DeleteRemoteRdpCommand, void>(
            new DeleteRemoteRdpCommand(UuidUtility.generate(), id),
        );
    }

    @Post(':id/copy')
    @ApiParam({ name: 'id', type: Number, required: true })
    @ApiOkResponse({ type: RemoteRdpCopiedDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async copyRemoteRdp(
        @Param('id') id: number,
        @Body() dtoInput: CopyRemoteRdpDtoInput,
    ): Promise<RemoteRdpCopiedDtoOutput> {
        const result = await this.commandBus.execute<CopyRemoteRdpCommand, RemoteRdp>(
            new CopyRemoteRdpCommand(
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
