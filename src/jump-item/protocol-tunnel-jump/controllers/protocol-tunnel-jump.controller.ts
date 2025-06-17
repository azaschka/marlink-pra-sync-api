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
    CopyProtocolTunnelJumpCommand,
    CreateProtocolTunnelJumpCommand,
    DeleteProtocolTunnelJumpCommand,
    ModifyProtocolTunnelJumpCommand,
} from '../commands';
import {
    CopyProtocolTunnelJumpDtoInput,
    CreateProtocolTunnelJumpDtoInput,
    ModifyProtocolTunnelJumpDtoInput,
    RetrieveProtocolTunnelJumpsDtoInput,
} from '../dtos/inputs';
import {
    ProtocolTunnelJumpCopiedDtoOutput,
    ProtocolTunnelJumpCreatedDtoOutput,
    ProtocolTunnelJumpModifiedDtoOutput,
    ProtocolTunnelJumpRetrievedDtoOutput,
} from '../dtos/outputs';
import { ProtocolTunnelJump } from '../models';
import { RetrieveProtocolTunnelJumpsQuery } from '../queries';

@ApiBearerAuth()
@ApiTags('Jump Items')
@Controller('jump-items/protocol-tunnel-jumps')
@UsePipes(new ValidationPipe({ transform: true }))
export class ProtocolTunnelJumpController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get()
    @ApiOkResponse({ type: ProtocolTunnelJumpRetrievedDtoOutput, isArray: true })
    public async retrieveProtocolTunnelJumps(
        @Query() dtoInput: RetrieveProtocolTunnelJumpsDtoInput,
    ): Promise<ProtocolTunnelJumpRetrievedDtoOutput[]> {
        const result = await this.queryBus.execute<RetrieveProtocolTunnelJumpsQuery, ProtocolTunnelJump[]>(
            new RetrieveProtocolTunnelJumpsQuery(
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
    @ApiCreatedResponse({ type: ProtocolTunnelJumpCreatedDtoOutput })
    public async createProtocolTunnelJump(
        @Body() dtoInput: CreateProtocolTunnelJumpDtoInput,
    ): Promise<ProtocolTunnelJumpCreatedDtoOutput> {
        const result = await this.commandBus.execute<CreateProtocolTunnelJumpCommand, ProtocolTunnelJump>(
            new CreateProtocolTunnelJumpCommand(
                UuidUtility.generate(),
                dtoInput.name,
                dtoInput.jumpointId,
                dtoInput.hostname,
                dtoInput.jumpGroupId,
                dtoInput.jumpGroupType,
                dtoInput.tag,
                dtoInput.comments,
                dtoInput.jumpPolicyId,
                dtoInput.sessionPolicyId,
                dtoInput.tunnelListenAddress,
                dtoInput.tunnelDefinitions,
                dtoInput.tunnelType,
                dtoInput.username,
                dtoInput.database,
                dtoInput.url,
                dtoInput.caCertificates,
            ),
        );

        return result;
    }

    @Patch(':id')
    @ApiOkResponse({ type: ProtocolTunnelJumpModifiedDtoOutput })
    public async modifyProtocolTunnelJump(
        @Param('id') id: number,
        @Body(new NonEmptyBodyPipe()) dtoInput: ModifyProtocolTunnelJumpDtoInput,
    ): Promise<ProtocolTunnelJumpModifiedDtoOutput> {
        const result = await this.commandBus.execute<ModifyProtocolTunnelJumpCommand, ProtocolTunnelJump>(
            new ModifyProtocolTunnelJumpCommand(
                UuidUtility.generate(),
                id,
                dtoInput.name,
                dtoInput.jumpointId,
                dtoInput.hostname,
                dtoInput.jumpGroupId,
                dtoInput.jumpGroupType,
                dtoInput.tag,
                dtoInput.comments,
                dtoInput.jumpPolicyId,
                dtoInput.sessionPolicyId,
                dtoInput.tunnelListenAddress,
                dtoInput.tunnelDefinitions,
                dtoInput.tunnelType,
                dtoInput.username,
                dtoInput.database,
                dtoInput.url,
                dtoInput.caCertificates,
            ),
        );

        return result;
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, required: true })
    @HttpCode(HttpStatus.NO_CONTENT)
    public async deleteProtocolTunnelJump(@Param('id') id: number): Promise<void> {
        await this.commandBus.execute<DeleteProtocolTunnelJumpCommand, void>(
            new DeleteProtocolTunnelJumpCommand(UuidUtility.generate(), id),
        );
    }

    @Post(':id/copy')
    @ApiParam({ name: 'id', type: Number, required: true })
    @ApiOkResponse({ type: ProtocolTunnelJumpCopiedDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async copyProtocolTunnelJump(
        @Param('id') id: number,
        @Body() dtoInput: CopyProtocolTunnelJumpDtoInput,
    ): Promise<ProtocolTunnelJumpCopiedDtoOutput> {
        const result = await this.commandBus.execute<CopyProtocolTunnelJumpCommand, ProtocolTunnelJump>(
            new CopyProtocolTunnelJumpCommand(
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
