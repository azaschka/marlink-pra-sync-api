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
import { CreateJumpointCommand, DeleteJumpointCommand, ModifyJumpointCommand } from '../commands';
import { CreateJumpointDtoInput, ModifyJumpointDtoInput, RetrieveJumpointsDtoInput } from '../dtos/inputs';
import { JumpointCreatedDtoOutput, JumpointModifiedDtoOutput, JumpointRetrievedDtoOutput } from '../dtos/outputs';
import { Jumpoint } from '../models';
import { RetrieveJumpointsQuery } from '../queries';

@ApiBearerAuth()
@ApiTags('Jumpoints')
@Controller('jumpoints')
@UsePipes(new ValidationPipe({ transform: true }))
export class JumpointController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get()
    @ApiOkResponse({ type: JumpointRetrievedDtoOutput, isArray: true })
    public async retrieveJumpoints(
        @Query() dtoInput: RetrieveJumpointsDtoInput,
    ): Promise<JumpointRetrievedDtoOutput[]> {
        const result = await this.queryBus.execute<RetrieveJumpointsQuery, Jumpoint[]>(
            new RetrieveJumpointsQuery(
                UuidUtility.generate(),
                dtoInput.pageSize,
                dtoInput.pageNumber,
                dtoInput.name,
                dtoInput.publicIp,
                dtoInput.privateIp,
                dtoInput.hostname,
                dtoInput.codeName,
            ),
        );

        return result;
    }

    @Post()
    @ApiCreatedResponse({
        type: JumpointCreatedDtoOutput,
        description: 'Indicates the Jumpoint was created successfully and contains the new instance.',
    })
    @ApiUnprocessableEntityResponse({
        description:
            'One or more request parameters are invalid. The body contains a general error message as well as a validation error dictionary.',
    })
    public async createJumpoint(@Body() dtoInput: CreateJumpointDtoInput): Promise<JumpointCreatedDtoOutput> {
        const result = await this.commandBus.execute<CreateJumpointCommand, Jumpoint>(
            new CreateJumpointCommand(
                UuidUtility.generate(),
                dtoInput.name,
                dtoInput.platformType,
                dtoInput.codeName,
                dtoInput.comments,
                dtoInput.isEnabled,
                dtoInput.isClustered,
                dtoInput.isShellJumpEnabled,
                dtoInput.externalJumpItemNetworkId,
                dtoInput.isProtocolTunnelEnabled,
                dtoInput.rdpServiceAccountId,
                dtoInput.managedIpRanges,
                dtoInput.isJzpEnabled,
                dtoInput.jzpProxyHostname,
                dtoInput.jzpProxyPort,
                dtoInput.isJzpHttpGetAllowed,
                dtoInput.jzpClientAddressRestrictionsType,
                dtoInput.jzpRestrictedIps,
            ),
        );

        return result;
    }

    @Patch(':id')
    @ApiParam({ name: 'id', type: Number, required: true, description: 'Unique identifier for the resource.' })
    @ApiOkResponse({
        type: JumpointModifiedDtoOutput,
        description: 'Indicates the existing Jumpoint was successfully updated and returns the new Jumpoint.',
    })
    @ApiNotFoundResponse({ description: 'The specified resource was not found.' })
    @ApiUnprocessableEntityResponse({
        description:
            'One or more request parameters are invalid. The body contains a general error message as well as a validation error dictionary.',
    })
    public async modifyJumpoint(
        @Param('id') id: number,
        @Body(new NonEmptyBodyPipe()) dtoInput: ModifyJumpointDtoInput,
    ): Promise<JumpointModifiedDtoOutput> {
        const result = await this.commandBus.execute<ModifyJumpointCommand, Jumpoint>(
            new ModifyJumpointCommand(
                UuidUtility.generate(),
                id,
                dtoInput.name,
                dtoInput.codeName,
                dtoInput.comments,
                dtoInput.isEnabled,
                dtoInput.isShellJumpEnabled,
                dtoInput.externalJumpItemNetworkId,
                dtoInput.isProtocolTunnelEnabled,
                dtoInput.rdpServiceAccountId,
                dtoInput.managedIpRanges,
                dtoInput.isJzpEnabled,
                dtoInput.jzpProxyHostname,
                dtoInput.jzpProxyPort,
                dtoInput.isJzpHttpGetAllowed,
                dtoInput.jzpClientAddressRestrictionsType,
                dtoInput.jzpRestrictedIps,
            ),
        );

        return result;
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, required: true, description: 'Unique identifier for the resource.' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({ description: 'Indicates the jumpoint was successfully deleted.' })
    @ApiNotFoundResponse({ description: 'The specified resource was not found.' })
    @ApiUnprocessableEntityResponse({
        description:
            'One or more request parameters are invalid. The body contains a general error message as well as a validation error dictionary.',
    })
    public async deleteJumpoint(@Param('id') id: number): Promise<void> {
        await this.commandBus.execute<DeleteJumpointCommand, void>(
            new DeleteJumpointCommand(UuidUtility.generate(), id),
        );
    }
}
