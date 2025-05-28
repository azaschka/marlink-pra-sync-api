import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { JumpPolicyRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-policy/dtos/outputs';
import { RetrieveJumpPoliciesQuery } from '../../../beyondtrust-pra-conf-api/jump-policy/queries';
import { DateUtility, ErrorProcessorUtility, ObjectUtility } from '../../../shared/utilities';
import { JumpPoliciesSyncedEvent, JumpPoliciesSyncFailedEvent } from '../../events';
import {
    mapFromBTApprovalApproverScopeType,
    mapFromBTApprovalScopeType,
    mapFromBTSimultaneousJumpsRdpType,
    mapFromBTSimultaneousJumpsType,
} from '../../mappers';
import { JumpPoliciesSyncResult } from '../../models';
import { JumpPolicyEntity } from '../../repositories/entities';
import { JumpPolicyRepositoryService } from '../../repositories/services/jump-policy-repository.service';
import { SyncJumpPoliciesCommand } from '../sync-jump-policies.command';

@CommandHandler(SyncJumpPoliciesCommand)
export class SyncJumpPoliciesCommandHandler implements ICommandHandler<SyncJumpPoliciesCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly jumpPolicyRepositoryService: JumpPolicyRepositoryService,
    ) {}

    public async execute(command: SyncJumpPoliciesCommand): Promise<JumpPoliciesSyncResult> {
        try {
            const startSyncUtcDate = DateUtility.getCurrentUtcDate();

            const createdJumpPolicyIds: number[] = [];
            const updatedJumpPolicyIds: number[] = [];
            const deletedJumpPolicyIds: number[] = [];

            await this.syncBTToDbJumpPoliciesPerPage(
                command.transactionId,
                1,
                createdJumpPolicyIds,
                updatedJumpPolicyIds,
            );
            await this.syncDbToBTJumpPoliciesPerPage(1, startSyncUtcDate, deletedJumpPolicyIds);

            this.eventBus.publish(
                new JumpPoliciesSyncedEvent(command.transactionId, {
                    createdJumpPolicyIds,
                    updatedJumpPolicyIds,
                    deletedJumpPolicyIds,
                }),
            );

            return {
                createdJumpPolicyIds,
                updatedJumpPolicyIds,
                deletedJumpPolicyIds,
            };
        } catch (error) {
            this.eventBus.publish(
                new JumpPoliciesSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                }),
            );

            throw error;
        }
    }

    private async syncBTToDbJumpPoliciesPerPage(
        transactionId: string,
        pageNumber: number,
        createdJumpPolicyIds: number[],
        updatedJumpPolicyIds: number[],
    ) {
        // Retrieve jump policies from BeyondTrust
        const btJumpPolicies = await this.queryBus.execute<RetrieveJumpPoliciesQuery, JumpPolicyRetrievedDtoOutput[]>(
            new RetrieveJumpPoliciesQuery(transactionId, this.appConfigService.sync.maxBatchSize, pageNumber),
        );

        // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
        if (
            ObjectUtility.contain(
                [...createdJumpPolicyIds, ...updatedJumpPolicyIds],
                btJumpPolicies.map((policy) => policy.id),
            )
        ) {
            return;
        }

        // Retrieve existing jump policies from the DB using BeyondTrust jump policy IDs
        const dbJumpPolicies = await this.jumpPolicyRepositoryService.findByIds(
            btJumpPolicies.map((policy) => policy.id).filter((id) => id !== undefined),
        );

        const jumpPoliciesToBeCreated = this.findAllJumpPoliciesToBeCreated(btJumpPolicies, dbJumpPolicies);
        const jumpPoliciesToBeUpdated = this.findAllJumpPoliciesToBeUpdatedOrUpdateLastSyncDate(
            btJumpPolicies,
            dbJumpPolicies,
        );

        if (jumpPoliciesToBeCreated.length > 0) {
            await this.jumpPolicyRepositoryService.createOrUpdateByIds(jumpPoliciesToBeCreated);
        }

        if (jumpPoliciesToBeUpdated.length > 0) {
            await this.jumpPolicyRepositoryService.createOrUpdateByIds(jumpPoliciesToBeUpdated);
        }

        // Collect created and updated jump policy IDs
        createdJumpPolicyIds.push(...jumpPoliciesToBeCreated.map((policy) => policy.id));
        updatedJumpPolicyIds.push(...jumpPoliciesToBeUpdated.map((policy) => policy.id));

        if (btJumpPolicies.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncBTToDbJumpPoliciesPerPage(
            transactionId,
            pageNumber + 1,
            createdJumpPolicyIds,
            updatedJumpPolicyIds,
        );
    }

    private async syncDbToBTJumpPoliciesPerPage(
        pageNumber: number,
        dateBeforeSyncingBTJumpPolicies: Date,
        deletedJumpPolicyIds: number[],
    ) {
        const dbJumpPolicies = await this.jumpPolicyRepositoryService.findByLastSyncDateBefore(
            dateBeforeSyncingBTJumpPolicies,
            pageNumber,
            this.appConfigService.sync.maxBatchSize,
        );
        const jumpPolicyIds = dbJumpPolicies.map((dbJumpPolicy) => dbJumpPolicy.id);

        if (jumpPolicyIds.length > 0) {
            await this.jumpPolicyRepositoryService.deleteByIds(jumpPolicyIds);
        }

        // Collect deleted jump policy IDs
        deletedJumpPolicyIds.push(...jumpPolicyIds);

        if (dbJumpPolicies.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncDbToBTJumpPoliciesPerPage(pageNumber + 1, dateBeforeSyncingBTJumpPolicies, deletedJumpPolicyIds);
    }

    private findAllJumpPoliciesToBeCreated(
        btJumpPolicies: JumpPolicyRetrievedDtoOutput[],
        dbJumpPolicies: JumpPolicyEntity[],
    ) {
        return btJumpPolicies
            .filter((btJumpPolicy) => !dbJumpPolicies.some((dbJumpPolicy) => dbJumpPolicy.id === btJumpPolicy.id))
            .map((btJumpPolicy) => this.createJumpPolicyEntity(btJumpPolicy));
    }

    private findAllJumpPoliciesToBeUpdatedOrUpdateLastSyncDate(
        btJumpPolicies: JumpPolicyRetrievedDtoOutput[],
        dbJumpPolicies: JumpPolicyEntity[],
    ) {
        return btJumpPolicies
            .filter((btJumpPolicy) => dbJumpPolicies.find((dbJumpPolicy) => dbJumpPolicy.id === btJumpPolicy.id))
            .map((btJumpPolicy) => this.createJumpPolicyEntity(btJumpPolicy));
    }

    private createJumpPolicyEntity(btJumpPolicy: JumpPolicyRetrievedDtoOutput) {
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
