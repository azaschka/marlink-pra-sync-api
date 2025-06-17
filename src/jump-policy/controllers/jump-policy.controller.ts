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
import { NonEmptyBodyPipe } from '../../shared/pipes';
import { UuidUtility } from '../../shared/utilities';
import { CreateJumpPolicyCommand, DeleteJumpPolicyCommand, ModifyJumpPolicyCommand } from '../commands';
import { CreateJumpPolicyDtoInput, ModifyJumpPolicyDtoInput, RetrieveJumpPoliciesDtoInput } from '../dtos/inputs';
import { JumpPolicyCreatedDtoOutput, JumpPolicyModifiedDtoOutput, JumpPolicyRetrievedDtoOutput } from '../dtos/outputs';
import { JumpPolicy } from '../models';
import { RetrieveJumpPoliciesQuery } from '../queries';

@ApiBearerAuth()
@ApiTags('Jump Policies')
@Controller('jump-policies')
@UsePipes(new ValidationPipe({ transform: true }))
export class JumpPolicyController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get()
    @ApiOkResponse({ type: JumpPolicyRetrievedDtoOutput, isArray: true })
    public async retrieveJumpPolicies(
        @Query() dtoInput: RetrieveJumpPoliciesDtoInput,
    ): Promise<JumpPolicyRetrievedDtoOutput[]> {
        const result = await this.queryBus.execute<RetrieveJumpPoliciesQuery, JumpPolicy[]>(
            new RetrieveJumpPoliciesQuery(
                UuidUtility.generate(),
                dtoInput.pageSize,
                dtoInput.pageNumber,
                dtoInput.codeName,
            ),
        );

        return result;
    }

    @Post()
    @ApiCreatedResponse({ type: JumpPolicyCreatedDtoOutput })
    public async createJumpPolicy(@Body() dtoInput: CreateJumpPolicyDtoInput): Promise<JumpPolicyCreatedDtoOutput> {
        const result = await this.commandBus.execute<CreateJumpPolicyCommand, JumpPolicy>(
            new CreateJumpPolicyCommand(
                UuidUtility.generate(),
                dtoInput.displayName,
                dtoInput.codeName,
                dtoInput.description,
                dtoInput.hasScheduledAccessRestriction,
                dtoInput.simultaneousJumpsType,
                dtoInput.doesSimultaneousJumpBehaviorApplyToCopies,
                dtoInput.simultaneousJumpsRdpType,
                dtoInput.shouldForceRemoveUsersWhenScheduleDisallows,
                dtoInput.isTicketIdRequired,
                dtoInput.isTwoFactorChallengeRequired,
                dtoInput.isSessionStartNotificationEnabled,
                dtoInput.isSessionEndNotificationEnabled,
                dtoInput.notificationEmailAddresses,
                dtoInput.notificationDisplayName,
                dtoInput.notificationEmailLanguage,
                dtoInput.isApprovalRequired,
                dtoInput.approvalMaxDurationInMinutes,
                dtoInput.approvalScopeType,
                dtoInput.approvalEmailAddresses,
                dtoInput.approvalUserIds,
                dtoInput.approvalTeamIds,
                dtoInput.approvalDisplayName,
                dtoInput.approvalEmailLanguage,
                dtoInput.approvalApproverScopeType,
                dtoInput.isRecordingsDisabled,
            ),
        );

        return result;
    }

    @Patch(':id')
    @ApiOkResponse({ type: JumpPolicyModifiedDtoOutput })
    public async modifyJumpPolicy(
        @Param('id') id: number,
        @Body(new NonEmptyBodyPipe()) dtoInput: ModifyJumpPolicyDtoInput,
    ): Promise<JumpPolicyModifiedDtoOutput> {
        const result = await this.commandBus.execute<ModifyJumpPolicyCommand, JumpPolicy>(
            new ModifyJumpPolicyCommand(
                UuidUtility.generate(),
                id,
                dtoInput.displayName,
                dtoInput.codeName,
                dtoInput.description,
                dtoInput.hasScheduledAccessRestriction,
                dtoInput.simultaneousJumpsType,
                dtoInput.doesSimultaneousJumpBehaviorApplyToCopies,
                dtoInput.simultaneousJumpsRdpType,
                dtoInput.shouldForceRemoveUsersWhenScheduleDisallows,
                dtoInput.isTicketIdRequired,
                dtoInput.isTwoFactorChallengeRequired,
                dtoInput.isSessionStartNotificationEnabled,
                dtoInput.isSessionEndNotificationEnabled,
                dtoInput.notificationEmailAddresses,
                dtoInput.notificationDisplayName,
                dtoInput.notificationEmailLanguage,
                dtoInput.isApprovalRequired,
                dtoInput.approvalMaxDurationInMinutes,
                dtoInput.approvalScopeType,
                dtoInput.approvalEmailAddresses,
                dtoInput.approvalUserIds,
                dtoInput.approvalTeamIds,
                dtoInput.approvalDisplayName,
                dtoInput.approvalEmailLanguage,
                dtoInput.approvalApproverScopeType,
                dtoInput.isRecordingsDisabled,
            ),
        );

        return result;
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, required: true })
    @HttpCode(HttpStatus.NO_CONTENT)
    public async deleteJumpPolicy(@Param('id') id: number): Promise<void> {
        await this.commandBus.execute<DeleteJumpPolicyCommand, void>(
            new DeleteJumpPolicyCommand(UuidUtility.generate(), id),
        );
    }
}
