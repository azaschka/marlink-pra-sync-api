import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CreateJumpPolicyCommand as BTCreateJumpPolicyCommand } from '../../../beyondtrust-pra-conf-api/jump-policy/commands';
import {
    JumpPolicyCreatedDtoOutput,
    JumpPolicyRetrievedDtoOutput,
} from '../../../beyondtrust-pra-conf-api/jump-policy/dtos/outputs';
import { RetrieveJumpPoliciesQuery as BTRetrieveJumpPoliciesQuery } from '../../../beyondtrust-pra-conf-api/jump-policy/queries';
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
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly jumpPolicyRepositoryService: JumpPolicyRepositoryService,
    ) {}

    public async execute(command: CreateJumpPolicyCommand): Promise<JumpPolicy> {
        const { btJumpPolicy, existedInBeyondTrust } = await this.getOrCreateBTJumpPolicy(command);
        const jumpPolicyEntity = this.createJumpPolicyEntity(btJumpPolicy);

        try {
            let savedJumpPolicy: JumpPolicy;

            if (existedInBeyondTrust) {
                // Policy already existed in BeyondTrust but was missing from the local sync DB.
                // Use upsert to heal the sync DB and avoid a duplicate-key error.
                await this.jumpPolicyRepositoryService.createOrUpdateById(command.tenantId, jumpPolicyEntity);
                savedJumpPolicy = jumpPolicyEntity;
            } else {
                savedJumpPolicy = await this.jumpPolicyRepositoryService.create(command.tenantId, jumpPolicyEntity);
            }

            this.eventBus.publish(
                new JumpPolicyCreatedEvent(command.transactionId, {
                    jumpPolicy: savedJumpPolicy,
                    tenantId: command.tenantId,
                }),
            );

            return savedJumpPolicy;
        } catch (error) {
            this.eventBus.publish(
                new JumpPolicyCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    jumpPolicy: jumpPolicyEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    /**
     * Attempts to create the jump policy in BeyondTrust.
     * If BeyondTrust rejects with 422 "already been taken" on any field, the existing policy
     * is fetched by codeName instead. This ensures true idempotency even when the local sync DB
     * is out of sync with BeyondTrust (e.g. after a DB reset or before the first discrepancy
     * scan has run).
     */
    private async getOrCreateBTJumpPolicy(
        command: CreateJumpPolicyCommand,
    ): Promise<{ btJumpPolicy: JumpPolicyCreatedDtoOutput; existedInBeyondTrust: boolean }> {
        try {
            const btJumpPolicy = await this.createBTJumpPolicy(command);
            return { btJumpPolicy, existedInBeyondTrust: false };
        } catch (error) {
            if (ErrorProcessorUtility.isBeyondTrustUnprocessableEntityError(error) && command.codeName !== undefined) {
                console.warn(
                    `[${command.transactionId}] Jump policy with codeName "${command.codeName}" already exists in ` +
                        `BeyondTrust (tenant: ${command.tenantId}). Fetching existing policy to ensure idempotency.`,
                );

                const existing = await this.fetchExistingBTJumpPolicyByCodeName(
                    command.transactionId,
                    command.tenantId,
                    command.codeName,
                );

                if (existing) {
                    // JumpPolicyRetrievedDtoOutput has an identical structure to JumpPolicyCreatedDtoOutput;
                    // casting is safe here.
                    return {
                        btJumpPolicy: existing as unknown as JumpPolicyCreatedDtoOutput,
                        existedInBeyondTrust: true,
                    };
                }
            }

            throw error;
        }
    }

    /**
     * Fetches the first jump policy from BeyondTrust that matches the given codeName.
     */
    private async fetchExistingBTJumpPolicyByCodeName(
        transactionId: string,
        tenantId: number,
        codeName: string,
    ): Promise<JumpPolicyRetrievedDtoOutput | null> {
        const policies = await this.queryBus.execute<BTRetrieveJumpPoliciesQuery, JumpPolicyRetrievedDtoOutput[]>(
            new BTRetrieveJumpPoliciesQuery(transactionId, tenantId, 1, 1, codeName),
        );
        return policies[0] ?? null;
    }

    private async createBTJumpPolicy(command: CreateJumpPolicyCommand) {
        return await this.commandBus.execute<BTCreateJumpPolicyCommand, JumpPolicyCreatedDtoOutput>(
            new BTCreateJumpPolicyCommand(
                command.transactionId,
                command.tenantId,
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
