import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateJumpPolicyCommand as BTCreateJumpPolicyCommand } from '../../../beyondtrust-pra-conf-api/jump-policy/commands';
import { JumpPolicyCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-policy/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpPolicyCreatedEvent, JumpPolicyCreationFailedEvent } from '../../events';
import {
    mapFromBTApprovalApproverScopeType,
    mapFromBTApprovalScopeType,
    mapFromBTSimultaneousJumpsRdpType,
    mapFromBTSimultaneousJumpsType,
    mapToBTApprovalApproverScopeType,
    mapToBTApprovalScopeType,
    mapToBTSimultaneousJumpsRdpType,
    mapToBTSimultaneousJumpsType,
} from '../../mappers';
import { JumpPolicy } from '../../models';
import { JumpPolicyEntity } from '../../repositories/entities';
import { JumpPolicyRepositoryService } from '../../repositories/services/jump-policy-repository.service';
import { CreateJumpPolicyCommand } from '../create-jump-policy.command';

@CommandHandler(CreateJumpPolicyCommand)
export class CreateJumpPolicyCommandHandler implements ICommandHandler<CreateJumpPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpPolicyRepositoryService: JumpPolicyRepositoryService,
    ) {}

    public async execute(command: CreateJumpPolicyCommand): Promise<JumpPolicy> {
        const btJumpPolicy = await this.createBTJumpPolicy(command);
        const jumpPolicyEntity = this.createJumpPolicyEntity(btJumpPolicy);

        try {
            const createdJumpPolicy = await this.jumpPolicyRepositoryService.create(jumpPolicyEntity);

            this.eventBus.publish(
                new JumpPolicyCreatedEvent(command.transactionId, {
                    jumpPolicy: createdJumpPolicy,
                }),
            );

            return createdJumpPolicy;
        } catch (error) {
            this.eventBus.publish(
                new JumpPolicyCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    jumpPolicy: jumpPolicyEntity,
                }),
            );

            throw error;
        }
    }

    private async createBTJumpPolicy(command: CreateJumpPolicyCommand) {
        return await this.commandBus.execute<BTCreateJumpPolicyCommand, JumpPolicyCreatedDtoOutput>(
            new BTCreateJumpPolicyCommand(
                command.transactionId,
                command.displayName,
                command.codeName,
                command.description,
                command.hasScheduledAccessRestriction,
                command.simultaneousJumpsType ? mapToBTSimultaneousJumpsType(command.simultaneousJumpsType) : undefined,
                command.doesSimultaneousJumpBehaviorApplyToCopies,
                command.simultaneousJumpsRdpType
                    ? mapToBTSimultaneousJumpsRdpType(command.simultaneousJumpsRdpType)
                    : undefined,
                command.shouldForceRemoveUsersWhenScheduleDisallows,
                command.isTicketIdRequired,
                command.isTwoFactorChallengeRequired,
                command.isSessionStartNotificationEnabled,
                command.isSessionEndNotificationEnabled,
                command.notificationEmailAddresses,
                command.notificationDisplayName,
                command.notificationEmailLanguage,
                command.isApprovalRequired,
                command.approvalMaxDurationInMinutes,
                command.approvalScopeType ? mapToBTApprovalScopeType(command.approvalScopeType) : undefined,
                command.approvalEmailAddresses,
                command.approvalUserIds,
                command.approvalTeamIds,
                command.approvalDisplayName,
                command.approvalEmailLanguage,
                command.approvalApproverScopeType
                    ? mapToBTApprovalApproverScopeType(command.approvalApproverScopeType)
                    : undefined,
                command.isRecordingsDisabled,
            ),
        );
    }

    private createJumpPolicyEntity(btJumpPolicy: JumpPolicyCreatedDtoOutput) {
        return JumpPolicyEntity.create(
            btJumpPolicy.id,
            btJumpPolicy.displayName,
            btJumpPolicy.codeName,
            btJumpPolicy.description,
            btJumpPolicy.scheduleEnabled,
            btJumpPolicy.simultaneousJumps ? mapFromBTSimultaneousJumpsType(btJumpPolicy.simultaneousJumps) : undefined,
            btJumpPolicy.simultaneousJumpBehaviorAppliesToCopies,
            btJumpPolicy.simultaneousJumpsRdp
                ? mapFromBTSimultaneousJumpsRdpType(btJumpPolicy.simultaneousJumpsRdp)
                : undefined,
            btJumpPolicy.scheduleStrict,
            btJumpPolicy.ticketIdRequired,
            btJumpPolicy.twoFactorChallengeRequired,
            btJumpPolicy.sessionStartNotification,
            btJumpPolicy.sessionEndNotification,
            btJumpPolicy.notificationEmailAddresses,
            btJumpPolicy.notificationDisplayName,
            btJumpPolicy.notificationEmailLanguage,
            btJumpPolicy.approvalRequired,
            btJumpPolicy.approvalMaxDuration,
            btJumpPolicy.approvalScope ? mapFromBTApprovalScopeType(btJumpPolicy.approvalScope) : undefined,
            btJumpPolicy.approvalEmailAddresses,
            btJumpPolicy.approvalUserIds,
            btJumpPolicy.approvalTeamIds,
            btJumpPolicy.approvalDisplayName,
            btJumpPolicy.approvalEmailLanguage,
            btJumpPolicy.approvalApproverScope
                ? mapFromBTApprovalApproverScopeType(btJumpPolicy.approvalApproverScope)
                : undefined,
            btJumpPolicy.recordingsDisabled,
        );
    }
}
