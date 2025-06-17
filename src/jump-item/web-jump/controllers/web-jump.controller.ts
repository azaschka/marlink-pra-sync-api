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
import { CopyWebJumpCommand, CreateWebJumpCommand, DeleteWebJumpCommand, ModifyWebJumpCommand } from '../commands';
import {
    CopyWebJumpDtoInput,
    CreateWebJumpDtoInput,
    ModifyWebJumpDtoInput,
    RetrieveWebJumpsDtoInput,
} from '../dtos/inputs';
import {
    WebJumpCopiedDtoOutput,
    WebJumpCreatedDtoOutput,
    WebJumpModifiedDtoOutput,
    WebJumpRetrievedDtoOutput,
} from '../dtos/outputs';
import { WebJump } from '../models';
import { RetrieveWebJumpsQuery } from '../queries';

@ApiBearerAuth()
@ApiTags('Jump Items')
@Controller('jump-items/web-jumps')
@UsePipes(new ValidationPipe({ transform: true }))
export class WebJumpController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get()
    @ApiOkResponse({ type: WebJumpRetrievedDtoOutput, isArray: true })
    public async retrieveWebJumps(@Query() dtoInput: RetrieveWebJumpsDtoInput): Promise<WebJumpRetrievedDtoOutput[]> {
        const result = await this.queryBus.execute<RetrieveWebJumpsQuery, WebJump[]>(
            new RetrieveWebJumpsQuery(
                UuidUtility.generate(),
                dtoInput.pageSize,
                dtoInput.pageNumber,
                dtoInput.name,
                dtoInput.url,
                dtoInput.jumpGroupId,
                dtoInput.jumpGroupType,
                dtoInput.jumpointId,
                dtoInput.tag,
            ),
        );

        return result;
    }

    @Post()
    @ApiCreatedResponse({ type: WebJumpCreatedDtoOutput })
    public async createWebJump(@Body() dtoInput: CreateWebJumpDtoInput): Promise<WebJumpCreatedDtoOutput> {
        const result = await this.commandBus.execute<CreateWebJumpCommand, WebJump>(
            new CreateWebJumpCommand(
                UuidUtility.generate(),
                dtoInput.name,
                dtoInput.jumpointId,
                dtoInput.url,
                dtoInput.jumpGroupId,
                dtoInput.jumpGroupType,
                dtoInput.usernameFormatType,
                dtoInput.mustVerifyCertificate,
                dtoInput.authenticationTimeoutInSeconds,
                dtoInput.tag,
                dtoInput.comments,
                dtoInput.jumpPolicyId,
                dtoInput.usernameField,
                dtoInput.passwordField,
                dtoInput.submitField,
                dtoInput.sessionPolicyId,
            ),
        );

        return result;
    }

    @Patch(':id')
    @ApiOkResponse({ type: WebJumpModifiedDtoOutput })
    public async modifyWebJump(
        @Param('id') id: number,
        @Body(new NonEmptyBodyPipe()) dtoInput: ModifyWebJumpDtoInput,
    ): Promise<WebJumpModifiedDtoOutput> {
        const result = await this.commandBus.execute<ModifyWebJumpCommand, WebJump>(
            new ModifyWebJumpCommand(
                UuidUtility.generate(),
                id,
                dtoInput.name,
                dtoInput.jumpointId,
                dtoInput.url,
                dtoInput.jumpGroupId,
                dtoInput.jumpGroupType,
                dtoInput.usernameFormatType,
                dtoInput.mustVerifyCertificate,
                dtoInput.authenticationTimeoutInSeconds,
                dtoInput.tag,
                dtoInput.comments,
                dtoInput.jumpPolicyId,
                dtoInput.usernameField,
                dtoInput.passwordField,
                dtoInput.submitField,
                dtoInput.sessionPolicyId,
            ),
        );

        return result;
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, required: true })
    @HttpCode(HttpStatus.NO_CONTENT)
    public async deleteWebJump(@Param('id') id: number): Promise<void> {
        await this.commandBus.execute<DeleteWebJumpCommand, void>(new DeleteWebJumpCommand(UuidUtility.generate(), id));
    }

    @Post(':id/copy')
    @ApiParam({ name: 'id', type: Number, required: true })
    @ApiOkResponse({ type: WebJumpCopiedDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async copyWebJump(
        @Param('id') id: number,
        @Body() dtoInput: CopyWebJumpDtoInput,
    ): Promise<WebJumpCopiedDtoOutput> {
        const result = await this.commandBus.execute<CopyWebJumpCommand, WebJump>(
            new CopyWebJumpCommand(
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
