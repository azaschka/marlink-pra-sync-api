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
import { CreateGroupPolicyCommand, DeleteGroupPolicyCommand, UpdateGroupPolicyCommand } from '../commands';
import { CreateGroupPolicyDtoInput, RetrieveGroupPoliciesDtoInput, UpdateGroupPolicyDtoInput } from '../dtos/inputs';
import {
    GroupPolicyCreatedDtoOutput,
    GroupPolicyRetrievedDtoOutput,
    GroupPolicyUpdatedDtoOutput,
} from '../dtos/outputs';
import { GroupPolicy } from '../models';
import { RetrieveGroupPoliciesQuery } from '../queries';

@ApiBearerAuth()
@ApiTags('Group Policies')
@Controller('group-policies')
@UsePipes(new ValidationPipe({ transform: true }))
export class GroupPolicyController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get()
    @ApiOkResponse({ type: GroupPolicyRetrievedDtoOutput, isArray: true })
    public async retrieveGroupPolicies(
        @Query() dtoInput: RetrieveGroupPoliciesDtoInput,
    ): Promise<GroupPolicyRetrievedDtoOutput[]> {
        const result = await this.queryBus.execute<RetrieveGroupPoliciesQuery, GroupPolicy[]>(
            new RetrieveGroupPoliciesQuery(
                UuidUtility.generate(),
                dtoInput.pageSize,
                dtoInput.pageNumber,
                dtoInput.name,
            ),
        );

        return result;
    }

    @Post()
    @ApiCreatedResponse({ type: GroupPolicyCreatedDtoOutput })
    public async createGroupPolicy(@Body() dtoInput: CreateGroupPolicyDtoInput): Promise<GroupPolicyCreatedDtoOutput> {
        const result = await this.commandBus.execute<CreateGroupPolicyCommand, GroupPolicy>(
            new CreateGroupPolicyCommand(
                UuidUtility.generate(),
                dtoInput.name,
                dtoInput.hasEndpointsAccessPermission,
                dtoInput.accessPermissionStatusType,
                dtoInput.hasShareOtherTeamPermission,
                dtoInput.hasInviteExternalUserPermission,
                dtoInput.userSessionIdleTimeoutInSeconds,
                dtoInput.hasEnableExtendedAvailabilityModePermission,
                dtoInput.hasEditExternalKeyPermission,
                dtoInput.hasCollaboratePermission,
                dtoInput.hasCollaborateControlPermission,
                dtoInput.hasJumpClientPermission,
                dtoInput.hasLocalJumpPermission,
                dtoInput.hasRemoteJumpPermission,
                dtoInput.hasRemoteVncPermission,
                dtoInput.hasRemoteRdpPermission,
                dtoInput.hasShellJumpPermission,
                dtoInput.hasWebJumpPermission,
                dtoInput.hasProtocolTunnelPermission,
                dtoInput.hasSdStaticPortForExternalToolsPermission,
                dtoInput.defaultJumpItemRoleId,
                dtoInput.privateJumpItemRoleId,
                dtoInput.inferiorJumpItemRoleId,
                dtoInput.unassignedJumpItemRoleId,
            ),
        );

        return result;
    }

    @Put(':id')
    @ApiOkResponse({ type: GroupPolicyUpdatedDtoOutput })
    public async updateGroupPolicy(
        @Query('id') id: number,
        @Body() dtoInput: UpdateGroupPolicyDtoInput,
    ): Promise<GroupPolicyUpdatedDtoOutput> {
        const result = await this.commandBus.execute<UpdateGroupPolicyCommand, GroupPolicy>(
            new UpdateGroupPolicyCommand(
                UuidUtility.generate(),
                id,
                dtoInput.name,
                dtoInput.hasEndpointsAccessPermission,
                dtoInput.accessPermissionStatusType,
                dtoInput.hasShareOtherTeamPermission,
                dtoInput.hasInviteExternalUserPermission,
                dtoInput.userSessionIdleTimeoutInSeconds,
                dtoInput.hasEnableExtendedAvailabilityModePermission,
                dtoInput.hasEditExternalKeyPermission,
                dtoInput.hasCollaboratePermission,
                dtoInput.hasCollaborateControlPermission,
                dtoInput.hasJumpClientPermission,
                dtoInput.hasLocalJumpPermission,
                dtoInput.hasRemoteJumpPermission,
                dtoInput.hasRemoteVncPermission,
                dtoInput.hasRemoteRdpPermission,
                dtoInput.hasShellJumpPermission,
                dtoInput.hasWebJumpPermission,
                dtoInput.hasProtocolTunnelPermission,
                dtoInput.hasSdStaticPortForExternalToolsPermission,
                dtoInput.defaultJumpItemRoleId,
                dtoInput.privateJumpItemRoleId,
                dtoInput.inferiorJumpItemRoleId,
                dtoInput.unassignedJumpItemRoleId,
            ),
        );

        return result;
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, required: true })
    @HttpCode(HttpStatus.NO_CONTENT)
    public async deleteGroupPolicy(@Param('id') id: number): Promise<void> {
        await this.commandBus.execute<DeleteGroupPolicyCommand, void>(
            new DeleteGroupPolicyCommand(UuidUtility.generate(), id),
        );
    }
}
