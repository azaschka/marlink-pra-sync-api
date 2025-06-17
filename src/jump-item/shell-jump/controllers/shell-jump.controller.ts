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
    CopyShellJumpCommand,
    CreateShellJumpCommand,
    DeleteShellJumpCommand,
    ModifyShellJumpCommand,
} from '../commands';
import {
    CopyShellJumpDtoInput,
    CreateShellJumpDtoInput,
    ModifyShellJumpDtoInput,
    RetrieveShellJumpsDtoInput,
} from '../dtos/inputs';
import {
    ShellJumpCopiedDtoOutput,
    ShellJumpCreatedDtoOutput,
    ShellJumpModifiedDtoOutput,
    ShellJumpRetrievedDtoOutput,
} from '../dtos/outputs';
import { ShellJump } from '../models';
import { RetrieveShellJumpsQuery } from '../queries';

@ApiBearerAuth()
@ApiTags('Jump Items')
@Controller('jump-items/shell-jumps')
@UsePipes(new ValidationPipe({ transform: true }))
export class ShellJumpController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get()
    @ApiOkResponse({ type: ShellJumpRetrievedDtoOutput, isArray: true })
    public async retrieveShellJumps(
        @Query() dtoInput: RetrieveShellJumpsDtoInput,
    ): Promise<ShellJumpRetrievedDtoOutput[]> {
        const result = await this.queryBus.execute<RetrieveShellJumpsQuery, ShellJump[]>(
            new RetrieveShellJumpsQuery(
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
    @ApiCreatedResponse({ type: ShellJumpCreatedDtoOutput })
    public async createShellJump(@Body() dtoInput: CreateShellJumpDtoInput): Promise<ShellJumpCreatedDtoOutput> {
        const result = await this.commandBus.execute<CreateShellJumpCommand, ShellJump>(
            new CreateShellJumpCommand(
                UuidUtility.generate(),
                dtoInput.name,
                dtoInput.jumpointId,
                dtoInput.hostname,
                dtoInput.protocolType,
                dtoInput.port,
                dtoInput.jumpGroupId,
                dtoInput.jumpGroupType,
                dtoInput.terminalType,
                dtoInput.keepAliveIdleSessionInSeconds,
                dtoInput.tag,
                dtoInput.comments,
                dtoInput.jumpPolicyId,
                dtoInput.username,
                dtoInput.sessionPolicyId,
            ),
        );

        return result;
    }

    @Patch(':id')
    @ApiOkResponse({ type: ShellJumpModifiedDtoOutput })
    public async modifyShellJump(
        @Param('id') id: number,
        @Body(new NonEmptyBodyPipe()) dtoInput: ModifyShellJumpDtoInput,
    ): Promise<ShellJumpModifiedDtoOutput> {
        const result = await this.commandBus.execute<ModifyShellJumpCommand, ShellJump>(
            new ModifyShellJumpCommand(
                UuidUtility.generate(),
                id,
                dtoInput.name,
                dtoInput.jumpointId,
                dtoInput.hostname,
                dtoInput.protocolType,
                dtoInput.port,
                dtoInput.jumpGroupId,
                dtoInput.jumpGroupType,
                dtoInput.terminalType,
                dtoInput.keepAliveIdleSessionInSeconds,
                dtoInput.tag,
                dtoInput.comments,
                dtoInput.jumpPolicyId,
                dtoInput.username,
                dtoInput.sessionPolicyId,
            ),
        );

        return result;
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, required: true })
    @HttpCode(HttpStatus.NO_CONTENT)
    public async deleteShellJump(@Param('id') id: number): Promise<void> {
        await this.commandBus.execute<DeleteShellJumpCommand, void>(
            new DeleteShellJumpCommand(UuidUtility.generate(), id),
        );
    }

    @Post(':id/copy')
    @ApiParam({ name: 'id', type: Number, required: true })
    @ApiOkResponse({ type: ShellJumpCopiedDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async copyShellJump(
        @Param('id') id: number,
        @Body() dtoInput: CopyShellJumpDtoInput,
    ): Promise<ShellJumpCopiedDtoOutput> {
        const result = await this.commandBus.execute<CopyShellJumpCommand, ShellJump>(
            new CopyShellJumpCommand(
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
