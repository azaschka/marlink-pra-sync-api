import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { RemoteRdpRetrievedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/dtos/outputs';
import { RetrieveRemoteRdpsQuery } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/queries';
import { DateUtility, ErrorProcessorUtility, ObjectUtility } from '../../../../shared/utilities';
import { RemoteRdpsSyncedEvent, RemoteRdpsSyncFailedEvent } from '../../events';
import { mapFromBTJumpGroupType, mapFromBTRdpQualityMode, mapFromBTSecureAppType } from '../../mappers';
import { RemoteRdpsSyncResult } from '../../models';
import { RemoteRdpEntity } from '../../repositories/entities';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';
import { SyncRemoteRdpsCommand } from '../sync-remote-rdps.command';

@CommandHandler(SyncRemoteRdpsCommand)
export class SyncRemoteRdpsCommandHandler implements ICommandHandler<SyncRemoteRdpsCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly remoteRdpRepositoryService: RemoteRdpRepositoryService,
    ) {}

    public async execute(command: SyncRemoteRdpsCommand): Promise<RemoteRdpsSyncResult> {
        try {
            const startSyncUtcDate = DateUtility.getCurrentUtcDate();

            const createdRemoteRdpIds: number[] = [];
            const updatedRemoteRdpIds: number[] = [];
            const deletedRemoteRdpIds: number[] = [];

            await this.syncBTToDbRemoteRdpsPerPage(
                command.transactionId,
                command.tenantId,
                1,
                createdRemoteRdpIds,
                updatedRemoteRdpIds,
            );
            await this.syncDbToBTRemoteRdpsPerPage(command.tenantId, 1, startSyncUtcDate, deletedRemoteRdpIds);

            this.eventBus.publish(
                new RemoteRdpsSyncedEvent(command.transactionId, {
                    createdRemoteRdpIds,
                    updatedRemoteRdpIds,
                    deletedRemoteRdpIds,
                    tenantId: command.tenantId,
                }),
            );

            return {
                createdRemoteRdpIds,
                updatedRemoteRdpIds,
                deletedRemoteRdpIds,
            };
        } catch (error) {
            this.eventBus.publish(
                new RemoteRdpsSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async syncBTToDbRemoteRdpsPerPage(
        transactionId: string,
        tenantId: number,
        pageNumber: number,
        createdRemoteRdpIds: number[],
        updatedRemoteRdpIds: number[],
    ) {
        // Retrieve remote rdps from BeyondTrust
        const btRemoteRdps = await this.queryBus.execute<RetrieveRemoteRdpsQuery, RemoteRdpRetrievedDtoOutput[]>(
            new RetrieveRemoteRdpsQuery(transactionId, this.appConfigService.sync.maxBatchSize, pageNumber),
        );

        // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
        if (
            ObjectUtility.contain(
                [...createdRemoteRdpIds, ...updatedRemoteRdpIds],
                btRemoteRdps.map((group) => group.id),
            )
        ) {
            return;
        }

        // Retrieve existing remote rdps from the DB using BeyondTrust remote rdp IDs
        const dbRemoteRdps = await this.remoteRdpRepositoryService.findByIds(
            tenantId,
            btRemoteRdps.map((remoteRdp) => remoteRdp.id).filter((id) => id !== undefined),
        );

        const remoteRdpsToBeCreated = this.findAllRemoteRdpsToBeCreated(btRemoteRdps, dbRemoteRdps);
        const remoteRdpsToBeUpdated = this.findAllRemoteRdpsToBeUpdatedOrUpdateLastSyncDate(btRemoteRdps, dbRemoteRdps);

        const createdRemoteRdps = await this.createOrUpdateByIds(transactionId, tenantId, remoteRdpsToBeCreated);
        const updatedRemoteRdps = await this.createOrUpdateByIds(transactionId, tenantId, remoteRdpsToBeUpdated);

        // Collect created and updated remote rdp IDs
        createdRemoteRdpIds.push(...createdRemoteRdps.map((remoteRdp) => remoteRdp.id));
        updatedRemoteRdpIds.push(...updatedRemoteRdps.map((remoteRdp) => remoteRdp.id));

        if (btRemoteRdps.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncBTToDbRemoteRdpsPerPage(
            transactionId,
            tenantId,
            pageNumber + 1,
            createdRemoteRdpIds,
            updatedRemoteRdpIds,
        );
    }

    private async syncDbToBTRemoteRdpsPerPage(
        tenantId: number,
        pageNumber: number,
        dateBeforeSyncingBTRemoteRdps: Date,
        deletedRemoteRdpIds: number[],
    ) {
        const dbRemoteRdps = await this.remoteRdpRepositoryService.findByLastSyncDateBefore(
            tenantId,
            dateBeforeSyncingBTRemoteRdps,
            pageNumber,
            this.appConfigService.sync.maxBatchSize,
        );
        const remoteRdpIds = dbRemoteRdps.map((dbRemoteRdp) => dbRemoteRdp.id);

        if (remoteRdpIds.length > 0) {
            await this.remoteRdpRepositoryService.deleteByIds(tenantId, remoteRdpIds);
        }

        // Collect deleted remote rdp IDs
        deletedRemoteRdpIds.push(...remoteRdpIds);

        if (dbRemoteRdps.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncDbToBTRemoteRdpsPerPage(
            tenantId,
            pageNumber + 1,
            dateBeforeSyncingBTRemoteRdps,
            deletedRemoteRdpIds,
        );
    }

    private findAllRemoteRdpsToBeCreated(btRemoteRdps: RemoteRdpRetrievedDtoOutput[], dbRemoteRdps: RemoteRdpEntity[]) {
        return btRemoteRdps
            .filter((btRemoteRdp) => !dbRemoteRdps.some((dbRemoteRdp) => dbRemoteRdp.id === btRemoteRdp.id))
            .map((btRemoteRdp) => this.createRemoteRdpEntity(btRemoteRdp));
    }

    private findAllRemoteRdpsToBeUpdatedOrUpdateLastSyncDate(
        btRemoteRdps: RemoteRdpRetrievedDtoOutput[],
        dbRemoteRdps: RemoteRdpEntity[],
    ) {
        return btRemoteRdps
            .filter((btRemoteRdp) => dbRemoteRdps.find((dbRemoteRdp) => dbRemoteRdp.id === btRemoteRdp.id))
            .map((btRemoteRdp) => this.createRemoteRdpEntity(btRemoteRdp));
    }

    private createRemoteRdpEntity(btRemoteRdp: RemoteRdpRetrievedDtoOutput) {
        return RemoteRdpEntity.create(
            btRemoteRdp.id,
            btRemoteRdp.name,
            btRemoteRdp.jumpointId,
            btRemoteRdp.hostname,
            btRemoteRdp.jumpGroupId,
            btRemoteRdp.jumpGroupType ? mapFromBTJumpGroupType(btRemoteRdp.jumpGroupType) : undefined,
            btRemoteRdp.quality ? mapFromBTRdpQualityMode(btRemoteRdp.quality) : undefined,
            btRemoteRdp.console,
            btRemoteRdp.ignoreUntrusted,
            btRemoteRdp.tag,
            btRemoteRdp.comments,
            btRemoteRdp.rdpUsername,
            btRemoteRdp.domain,
            btRemoteRdp.jumpPolicyId,
            btRemoteRdp.sessionForensics,
            btRemoteRdp.sessionPolicyId,
            btRemoteRdp.endpointId,
            btRemoteRdp.secureAppType ? mapFromBTSecureAppType(btRemoteRdp.secureAppType) : undefined,
            btRemoteRdp.remoteAppName,
            btRemoteRdp.remoteAppParams,
            btRemoteRdp.remoteExePath,
            btRemoteRdp.remoteExeParams,
            btRemoteRdp.targetSystem,
            btRemoteRdp.credentialType,
        );
    }

    private async createOrUpdateByIds(
        transactionId: string,
        tenantId: number,
        remoteRdps: RemoteRdpEntity[],
    ): Promise<RemoteRdpEntity[]> {
        const createdOrUpdatedEntities: RemoteRdpEntity[] = [];

        if (remoteRdps.length === 0) {
            return createdOrUpdatedEntities;
        }

        for (const remoteRdp of remoteRdps) {
            try {
                await this.remoteRdpRepositoryService.createOrUpdateById(tenantId, remoteRdp);
                createdOrUpdatedEntities.push(remoteRdp);
            } catch (error) {
                this.eventBus.publish(
                    new RemoteRdpsSyncFailedEvent(transactionId, {
                        errorMessage: `Error syncing remote RDP with id ${remoteRdp.id}. Error: ${ErrorProcessorUtility.stringify(error)}`,
                        tenantId: tenantId,
                    }),
                );
            }
        }

        return createdOrUpdatedEntities;
    }
}
