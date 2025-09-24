import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { JumpointRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jumpoint/dtos/outputs';
import { RetrieveJumpointsQuery } from '../../../beyondtrust-pra-conf-api/jumpoint/queries';
import { DateUtility, ErrorProcessorUtility, ObjectUtility } from '../../../shared/utilities';
import { JumpointsSyncedEvent, JumpointsSyncFailedEvent } from '../../events';
import { mapFromBTJumpointPlatformType, mapFromBTJzpClientAddressRestrictionsType } from '../../mappers';
import { JumpointsSyncResult } from '../../models';
import { JumpointEntity } from '../../repositories/entities';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { SyncJumpointsCommand } from '../sync-jumpoints.command';

@CommandHandler(SyncJumpointsCommand)
export class SyncJumpointsCommandHandler implements ICommandHandler<SyncJumpointsCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly jumpointRepositoryService: JumpointRepositoryService,
    ) {}

    public async execute(command: SyncJumpointsCommand): Promise<JumpointsSyncResult> {
        try {
            const startSyncUtcDate = DateUtility.getCurrentUtcDate();

            const createdJumpointIds: number[] = [];
            const updatedJumpointIds: number[] = [];
            const deletedJumpointIds: number[] = [];

            await this.syncBTToDbJumpointsPerPage(
                command.transactionId,
                command.tenantId,
                1,
                createdJumpointIds,
                updatedJumpointIds,
            );
            await this.syncDbToBTJumpointsPerPage(command.tenantId, 1, startSyncUtcDate, deletedJumpointIds);

            this.eventBus.publish(
                new JumpointsSyncedEvent(command.transactionId, {
                    tenantId: command.tenantId,
                    createdJumpointIds,
                    updatedJumpointIds,
                    deletedJumpointIds,
                }),
            );

            return {
                createdJumpointIds,
                updatedJumpointIds,
                deletedJumpointIds,
            };
        } catch (error) {
            this.eventBus.publish(
                new JumpointsSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async syncBTToDbJumpointsPerPage(
        transactionId: string,
        tenantId: number,
        pageNumber: number,
        createdJumpointIds: number[],
        updatedJumpointIds: number[],
    ) {
        // Retrieve jumpoints from BeyondTrust
        const btJumpoints = await this.queryBus.execute<RetrieveJumpointsQuery, JumpointRetrievedDtoOutput[]>(
            new RetrieveJumpointsQuery(transactionId, this.appConfigService.sync.maxBatchSize, pageNumber),
        );

        // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
        if (
            ObjectUtility.contain(
                [...createdJumpointIds, ...updatedJumpointIds],
                btJumpoints.map((jumpoint) => jumpoint.id),
            )
        ) {
            return;
        }

        // Retrieve existing jumpoints from the DB using BeyondTrust jumpoint IDs
        const dbJumpoints = await this.jumpointRepositoryService.findByIds(
            tenantId,
            btJumpoints.map((jumpoint) => jumpoint.id).filter((id) => id !== undefined),
        );

        const jumpointsToBeCreated = this.findAllJumpointsToBeCreated(btJumpoints, dbJumpoints);
        const jumpointsToBeUpdated = this.findAllJumpointsToBeUpdatedOrUpdateLastSyncDate(btJumpoints, dbJumpoints);

        if (jumpointsToBeCreated.length > 0) {
            await this.jumpointRepositoryService.createOrUpdateByIds(tenantId, jumpointsToBeCreated);
        }

        if (jumpointsToBeUpdated.length > 0) {
            await this.jumpointRepositoryService.createOrUpdateByIds(tenantId, jumpointsToBeUpdated);
        }

        // Collect created and updated jumpoint IDs
        createdJumpointIds.push(...jumpointsToBeCreated.map((jumpoint) => jumpoint.id));
        updatedJumpointIds.push(...jumpointsToBeUpdated.map((jumpoint) => jumpoint.id));

        if (btJumpoints.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncBTToDbJumpointsPerPage(
            transactionId,
            tenantId,
            pageNumber + 1,
            createdJumpointIds,
            updatedJumpointIds,
        );
    }

    private async syncDbToBTJumpointsPerPage(
        tenantId: number,
        pageNumber: number,
        dateBeforeSyncingBTJumpoints: Date,
        deletedJumpointIds: number[],
    ) {
        const dbJumpoints = await this.jumpointRepositoryService.findByLastSyncDateBefore(
            tenantId,
            dateBeforeSyncingBTJumpoints,
            pageNumber,
            this.appConfigService.sync.maxBatchSize,
        );
        const jumpointIds = dbJumpoints.map((dbJumpoint) => dbJumpoint.id);

        if (jumpointIds.length > 0) {
            await this.jumpointRepositoryService.deleteByIds(tenantId, jumpointIds);
        }

        // Collect deleted jumpoint IDs
        deletedJumpointIds.push(...jumpointIds);

        if (dbJumpoints.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncDbToBTJumpointsPerPage(
            tenantId,
            pageNumber + 1,
            dateBeforeSyncingBTJumpoints,
            deletedJumpointIds,
        );
    }

    private findAllJumpointsToBeCreated(btJumpoints: JumpointRetrievedDtoOutput[], dbJumpoints: JumpointEntity[]) {
        return btJumpoints
            .filter((btJumpoint) => !dbJumpoints.some((dbJumpoint) => dbJumpoint.id === btJumpoint.id))
            .map((btJumpoint) => this.createJumpointEntity(btJumpoint));
    }

    private findAllJumpointsToBeUpdatedOrUpdateLastSyncDate(
        btJumpoints: JumpointRetrievedDtoOutput[],
        dbJumpoints: JumpointEntity[],
    ) {
        return btJumpoints
            .filter((btJumpoint) => dbJumpoints.find((dbJumpoint) => dbJumpoint.id === btJumpoint.id))
            .map((btJumpoint) => this.createJumpointEntity(btJumpoint));
    }

    private createJumpointEntity(btJumpoint: JumpointRetrievedDtoOutput) {
        return JumpointEntity.create(
            btJumpoint.id,
            btJumpoint.name,
            mapFromBTJumpointPlatformType(btJumpoint.platform),
            btJumpoint.codeName,
            btJumpoint.comments,
            btJumpoint.enabled,
            btJumpoint.connected,
            btJumpoint.clustered,
            btJumpoint.shellJumpEnabled,
            btJumpoint.externalJumpItemNetworkId,
            btJumpoint.protocolTunnelEnabled,
            btJumpoint.rdpServiceAccountId,
            btJumpoint.managedIpRanges,
            btJumpoint.jzpEnabled,
            btJumpoint.jzpProxyHostname,
            btJumpoint.jzpProxyPort,
            btJumpoint.jzpAllowHttpGet,
            btJumpoint.jzpClientAddressRestrictionsType
                ? mapFromBTJzpClientAddressRestrictionsType(btJumpoint.jzpClientAddressRestrictionsType)
                : undefined,
            btJumpoint.jzpRestrictedIps,
            btJumpoint.dockerDeployKey,
            btJumpoint.keyInfo,
        );
    }
}
