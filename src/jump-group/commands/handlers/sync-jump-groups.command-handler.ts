import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { JumpGroupRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-group/dtos/outputs';
import { RetrieveJumpGroupsQuery } from '../../../beyondtrust-pra-conf-api/jump-group/queries';
import { DateUtility, ErrorProcessorUtility, ObjectUtility } from '../../../shared/utilities';
import { JumpGroupsSyncedEvent, JumpGroupsSyncFailedEvent } from '../../events';
import { JumpGroupsSyncResult } from '../../models';
import { JumpGroupEntity } from '../../repositories/entities';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { SyncJumpGroupsCommand } from '../sync-jump-groups.command';

@CommandHandler(SyncJumpGroupsCommand)
export class SyncJumpGroupsCommandHandler implements ICommandHandler<SyncJumpGroupsCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly jumpGroupRepositoryService: JumpGroupRepositoryService,
    ) {}

    public async execute(command: SyncJumpGroupsCommand): Promise<JumpGroupsSyncResult> {
        try {
            const startSyncUtcDate = DateUtility.getCurrentUtcDate();

            const createdJumpGroupIds: number[] = [];
            const updatedJumpGroupIds: number[] = [];
            const deletedJumpGroupIds: number[] = [];

            await this.syncBTToDbJumpGroupsPerPage(
                command.transactionId,
                command.tenantId,
                1,
                createdJumpGroupIds,
                updatedJumpGroupIds,
            );
            await this.syncDbToBTJumpGroupsPerPage(command.tenantId, 1, startSyncUtcDate, deletedJumpGroupIds);

            this.eventBus.publish(
                new JumpGroupsSyncedEvent(command.transactionId, {
                    createdJumpGroupIds,
                    updatedJumpGroupIds,
                    deletedJumpGroupIds,
                    tenantId: command.tenantId,
                }),
            );

            return {
                createdJumpGroupIds,
                updatedJumpGroupIds,
                deletedJumpGroupIds,
            };
        } catch (error) {
            this.eventBus.publish(
                new JumpGroupsSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async syncBTToDbJumpGroupsPerPage(
        transactionId: string,
        tenantId: number,
        pageNumber: number,
        createdJumpGroupIds: number[],
        updatedJumpGroupIds: number[],
    ) {
        // Retrieve jump groups from BeyondTrust
        const btJumpGroups = await this.queryBus.execute<RetrieveJumpGroupsQuery, JumpGroupRetrievedDtoOutput[]>(
            new RetrieveJumpGroupsQuery(transactionId, tenantId, this.appConfigService.sync.maxBatchSize, pageNumber),
        );

        // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
        if (
            ObjectUtility.contain(
                [...createdJumpGroupIds, ...updatedJumpGroupIds],
                btJumpGroups.map((group) => group.id),
            )
        ) {
            return;
        }

        // Retrieve existing jump groups from the DB using BeyondTrust jump group IDs
        const dbJumpGroups = await this.jumpGroupRepositoryService.findByIds(
            tenantId,
            btJumpGroups.map((jumpGroup) => jumpGroup.id).filter((id) => id !== undefined),
        );

        const jumpGroupsToBeCreated = this.findAllJumpGroupsToBeCreated(btJumpGroups, dbJumpGroups);
        const jumpGroupsToBeUpdated = this.findAllJumpGroupsToBeUpdatedOrUpdateLastSyncDate(btJumpGroups, dbJumpGroups);

        if (jumpGroupsToBeCreated.length > 0) {
            await this.jumpGroupRepositoryService.createOrUpdateByIds(tenantId, jumpGroupsToBeCreated);
        }

        if (jumpGroupsToBeUpdated.length > 0) {
            await this.jumpGroupRepositoryService.createOrUpdateByIds(tenantId, jumpGroupsToBeUpdated);
        }

        // Collect created and updated jump group IDs
        createdJumpGroupIds.push(...jumpGroupsToBeCreated.map((jumpGroup) => jumpGroup.id));
        updatedJumpGroupIds.push(...jumpGroupsToBeUpdated.map((jumpGroup) => jumpGroup.id));

        if (btJumpGroups.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncBTToDbJumpGroupsPerPage(
            transactionId,
            tenantId,
            pageNumber + 1,
            createdJumpGroupIds,
            updatedJumpGroupIds,
        );
    }

    private async syncDbToBTJumpGroupsPerPage(
        tenantId: number,
        pageNumber: number,
        dateBeforeSyncingBTJumpGroups: Date,
        deletedJumpGroupIds: number[],
    ) {
        const dbJumpGroups = await this.jumpGroupRepositoryService.findByLastSyncDateBefore(
            tenantId,
            dateBeforeSyncingBTJumpGroups,
            pageNumber,
            this.appConfigService.sync.maxBatchSize,
        );
        const jumpGroupIds = dbJumpGroups.map((dbJumpGroup) => dbJumpGroup.id);

        if (jumpGroupIds.length > 0) {
            await this.jumpGroupRepositoryService.deleteByIds(tenantId, jumpGroupIds);
        }

        // Collect deleted jump group IDs
        deletedJumpGroupIds.push(...jumpGroupIds);

        if (dbJumpGroups.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncDbToBTJumpGroupsPerPage(
            tenantId,
            pageNumber + 1,
            dateBeforeSyncingBTJumpGroups,
            deletedJumpGroupIds,
        );
    }

    private findAllJumpGroupsToBeCreated(btJumpGroups: JumpGroupRetrievedDtoOutput[], dbJumpGroups: JumpGroupEntity[]) {
        return btJumpGroups
            .filter((btJumpGroup) => !dbJumpGroups.some((dbJumpGroup) => dbJumpGroup.id === btJumpGroup.id))
            .map((btJumpGroup) => this.createJumpGroupEntity(btJumpGroup));
    }

    private findAllJumpGroupsToBeUpdatedOrUpdateLastSyncDate(
        btJumpGroups: JumpGroupRetrievedDtoOutput[],
        dbJumpGroups: JumpGroupEntity[],
    ) {
        return btJumpGroups
            .filter((btJumpGroup) => dbJumpGroups.find((dbJumpGroup) => dbJumpGroup.id === btJumpGroup.id))
            .map((btJumpGroup) => this.createJumpGroupEntity(btJumpGroup));
    }

    private createJumpGroupEntity(btJumpGroup: JumpGroupRetrievedDtoOutput) {
        return JumpGroupEntity.create(btJumpGroup.id, btJumpGroup.name, btJumpGroup.codeName, btJumpGroup.comments);
    }
}
