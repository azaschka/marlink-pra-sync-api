import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { GroupPolicyRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { RetrieveGroupPoliciesQuery } from '../../../beyondtrust-pra-conf-api/group-policy/queries';
import { DateUtility, ErrorProcessorUtility, ObjectUtility } from '../../../shared/utilities';
import { GroupPoliciesSyncedEvent, GroupPoliciesSyncFailedEvent } from '../../events';
import { mapFromBTAccessPermissionStatusType } from '../../mappers';
import { GroupPoliciesSyncResult } from '../../models';
import { GroupPolicyEntity } from '../../repositories/entities';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { SyncGroupPoliciesCommand } from '../sync-group-policies.command';

@CommandHandler(SyncGroupPoliciesCommand)
export class SyncGroupPoliciesCommandHandler implements ICommandHandler<SyncGroupPoliciesCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyRepositoryService: GroupPolicyRepositoryService,
    ) {}

    public async execute(command: SyncGroupPoliciesCommand): Promise<GroupPoliciesSyncResult> {
        try {
            const startSyncUtcDate = DateUtility.getCurrentUtcDate();

            const createdGroupPolicyIds: number[] = [];
            const updatedGroupPolicyIds: number[] = [];
            const deletedGroupPolicyIds: number[] = [];

            await this.syncBTToDbGroupPoliciesPerPage(
                command.transactionId,
                command.tenantId,
                1,
                createdGroupPolicyIds,
                updatedGroupPolicyIds,
            );
            await this.syncDbToBTGroupPoliciesPerPage(command.tenantId, 1, startSyncUtcDate, deletedGroupPolicyIds);

            this.eventBus.publish(
                new GroupPoliciesSyncedEvent(command.transactionId, {
                    tenantId: command.tenantId,
                    createdGroupPolicyIds,
                    updatedGroupPolicyIds,
                    deletedGroupPolicyIds,
                }),
            );

            return {
                createdGroupPolicyIds,
                updatedGroupPolicyIds,
                deletedGroupPolicyIds,
            };
        } catch (error) {
            this.eventBus.publish(
                new GroupPoliciesSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async syncBTToDbGroupPoliciesPerPage(
        transactionId: string,
        tenantId: number,
        pageNumber: number,
        createdGroupPolicyIds: number[],
        updatedGroupPolicyIds: number[],
    ) {
        // Retrieve group policies from BeyondTrust
        const btGroupPolicies = await this.queryBus.execute<
            RetrieveGroupPoliciesQuery,
            GroupPolicyRetrievedDtoOutput[]
        >(new RetrieveGroupPoliciesQuery(transactionId, this.appConfigService.sync.maxBatchSize, pageNumber));

        // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
        if (
            ObjectUtility.contain(
                [...createdGroupPolicyIds, ...updatedGroupPolicyIds],
                btGroupPolicies.map((policy) => policy.id),
            )
        ) {
            return;
        }

        // Retrieve existing group policies from the DB using BeyondTrust group policy IDs
        const dbGroupPolicies = await this.groupPolicyRepositoryService.findByIds(
            tenantId,
            btGroupPolicies.map((policy) => policy.id).filter((id) => id !== undefined),
        );

        const groupPoliciesToBeCreated = this.findAllGroupPoliciesToBeCreated(btGroupPolicies, dbGroupPolicies);
        const groupPoliciesToBeUpdated = this.findAllGroupPoliciesToBeUpdatedOrUpdateLastSyncDate(
            btGroupPolicies,
            dbGroupPolicies,
        );

        if (groupPoliciesToBeCreated.length > 0) {
            await this.groupPolicyRepositoryService.createOrUpdateByIds(tenantId, groupPoliciesToBeCreated);
        }

        if (groupPoliciesToBeUpdated.length > 0) {
            await this.groupPolicyRepositoryService.createOrUpdateByIds(tenantId, groupPoliciesToBeUpdated);
        }

        // Collect created and updated group policy IDs
        createdGroupPolicyIds.push(...groupPoliciesToBeCreated.map((policy) => policy.id));
        updatedGroupPolicyIds.push(...groupPoliciesToBeUpdated.map((policy) => policy.id));

        if (btGroupPolicies.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncBTToDbGroupPoliciesPerPage(
            transactionId,
            tenantId,
            pageNumber + 1,
            createdGroupPolicyIds,
            updatedGroupPolicyIds,
        );
    }

    private async syncDbToBTGroupPoliciesPerPage(
        tenantId: number,
        pageNumber: number,
        dateBeforeSyncingBTGroupPolicies: Date,
        deletedGroupPolicyIds: number[],
    ) {
        const dbGroupPolicies = await this.groupPolicyRepositoryService.findByLastSyncDateBefore(
            tenantId,
            dateBeforeSyncingBTGroupPolicies,
            pageNumber,
            this.appConfigService.sync.maxBatchSize,
        );
        const groupPolicyIds = dbGroupPolicies.map((dbGroupPolicy) => dbGroupPolicy.id);

        if (groupPolicyIds.length > 0) {
            await this.groupPolicyRepositoryService.deleteByIds(tenantId, groupPolicyIds);
        }

        // Collect deleted group policy IDs
        deletedGroupPolicyIds.push(...groupPolicyIds);

        if (dbGroupPolicies.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncDbToBTGroupPoliciesPerPage(
            tenantId,
            pageNumber + 1,
            dateBeforeSyncingBTGroupPolicies,
            deletedGroupPolicyIds,
        );
    }

    private findAllGroupPoliciesToBeCreated(
        btGroupPolicies: GroupPolicyRetrievedDtoOutput[],
        dbGroupPolicies: GroupPolicyEntity[],
    ) {
        return btGroupPolicies
            .filter((btGroupPolicy) => !dbGroupPolicies.some((dbGroupPolicy) => dbGroupPolicy.id === btGroupPolicy.id))
            .map((btGroupPolicy) => this.createGroupPolicyEntity(btGroupPolicy));
    }

    private findAllGroupPoliciesToBeUpdatedOrUpdateLastSyncDate(
        btGroupPolicies: GroupPolicyRetrievedDtoOutput[],
        dbGroupPolicies: GroupPolicyEntity[],
    ) {
        return btGroupPolicies
            .filter((btGroupPolicy) => dbGroupPolicies.find((dbGroupPolicy) => dbGroupPolicy.id === btGroupPolicy.id))
            .map((btGroupPolicy) => this.createGroupPolicyEntity(btGroupPolicy));
    }

    private createGroupPolicyEntity(btGroupPolicy: GroupPolicyRetrievedDtoOutput) {
        return GroupPolicyEntity.create(
            btGroupPolicy.id,
            btGroupPolicy.name,
            btGroupPolicy.permAccessAllowed,
            btGroupPolicy.accessPermStatus
                ? mapFromBTAccessPermissionStatusType(btGroupPolicy.accessPermStatus)
                : undefined,
            btGroupPolicy.permShareOtherTeam,
            btGroupPolicy.permInviteExternalUser,
            btGroupPolicy.permSessionIdleTimeout,
            btGroupPolicy.permExtendedAvailabilityModeAllowed,
            btGroupPolicy.permEditExternalKey,
            btGroupPolicy.permCollaborate,
            btGroupPolicy.permCollaborateControl,
            btGroupPolicy.permJumpClient,
            btGroupPolicy.permLocalJump,
            btGroupPolicy.permRemoteJump,
            btGroupPolicy.permRemoteVnc,
            btGroupPolicy.permRemoteRdp,
            btGroupPolicy.permShellJump,
            btGroupPolicy.permWebJump,
            btGroupPolicy.permProtocolTunnel,
            btGroupPolicy.permSdStaticPortForExternalTools,
            btGroupPolicy.defaultJumpItemRoleId,
            btGroupPolicy.privateJumpItemRoleId,
            btGroupPolicy.inferiorJumpItemRoleId,
            btGroupPolicy.unassignedJumpItemRoleId,
        );
    }
}
