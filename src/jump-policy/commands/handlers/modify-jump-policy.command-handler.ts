import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ModifyJumpPolicyCommand as BTModifyJumpPolicyCommand } from '../../../beyondtrust-pra-conf-api/jump-policy/commands';
import { JumpPolicyModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-policy/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpPolicyModificationFailedEvent, JumpPolicyModifiedEvent } from '../../events';
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
import { ModifyJumpPolicyCommand } from '../modify-jump-policy.command';

@CommandHandler(ModifyJumpPolicyCommand)
export class ModifyJumpPolicyCommandHandler implements ICommandHandler<ModifyJumpPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpPolicyRepositoryService: JumpPolicyRepositoryService,
    ) {}

    public async execute(command: ModifyJumpPolicyCommand): Promise<JumpPolicy> {
        const btJumpPolicy = await this.modifyBTJumpPolicy(command);
        const jumpPolicyEntity = this.createJumpPolicyEntity(btJumpPolicy);

        try {
            const updatedJumpPolicy = await this.updateJumpPolicy(jumpPolicyEntity);

            this.eventBus.publish(
                new JumpPolicyModifiedEvent(command.transactionId, {
                    jumpPolicy: updatedJumpPolicy,
                }),
            );

            return updatedJumpPolicy;
        } catch (error) {
            this.eventBus.publish(
                new JumpPolicyModificationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    jumpPolicy: jumpPolicyEntity,
                }),
            );

            throw error;
        }
    }

    private async modifyBTJumpPolicy(command: ModifyJumpPolicyCommand) {
        return await this.commandBus.execute<BTModifyJumpPolicyCommand, JumpPolicyModifiedDtoOutput>(
            new BTModifyJumpPolicyCommand(
                command.transactionId,
                command.id,
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

    private createJumpPolicyEntity(btJumpPolicy: JumpPolicyModifiedDtoOutput) {
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

    private async updateJumpPolicy(jumpPolicyEntity: JumpPolicyEntity) {
        await this.jumpPolicyRepositoryService.createOrUpdateById(jumpPolicyEntity);

        const createdOrUpdatedJumpPolicy = await this.jumpPolicyRepositoryService.findOneById(jumpPolicyEntity.id);

        if (!createdOrUpdatedJumpPolicy) {
            throw new Error('Jump policy has been created or updated but could not be retrieved.');
        }

        return createdOrUpdatedJumpPolicy;
    }
}
