import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { RemoteVncRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/dtos/outputs';
import { RetrieveRemoteVncsQuery } from '../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/queries';
import { RemoteVncsSyncedEvent, RemoteVncsSyncFailedEvent } from '../../../jump-item/remote-vnc/events';
import { mapFromBTJumpGroupType } from '../../../jump-item/remote-vnc/mappers';
import { RemoteVncsSyncResult } from '../../../jump-item/remote-vnc/models';
import { RemoteVncEntity } from '../../../jump-item/remote-vnc/repositories/entities';
import { RemoteVncRepositoryService } from '../../../jump-item/remote-vnc/repositories/services/remote-vnc-repository.service';
import { DateUtility, ErrorProcessorUtility, ObjectUtility } from '../../../shared/utilities';
import { SyncRemoteVncsCommand } from '../sync-remote-vncs.command';

@CommandHandler(SyncRemoteVncsCommand)
export class SyncRemoteVncsCommandHandler implements ICommandHandler<SyncRemoteVncsCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly remoteVncRepositoryService: RemoteVncRepositoryService,
    ) {}

    public async execute(command: SyncRemoteVncsCommand): Promise<RemoteVncsSyncResult> {
        try {
            const startSyncUtcDate = DateUtility.getCurrentUtcDate();

            const createdRemoteVncIds: number[] = [];
            const updatedRemoteVncIds: number[] = [];
            const deletedRemoteVncIds: number[] = [];

            await this.syncBTToDbRemoteVncsPerPage(
                command.transactionId,
                command.tenantId,
                1,
                createdRemoteVncIds,
                updatedRemoteVncIds,
            );
            await this.syncDbToBTRemoteVncsPerPage(command.tenantId, 1, startSyncUtcDate, deletedRemoteVncIds);

            this.eventBus.publish(
                new RemoteVncsSyncedEvent(command.transactionId, {
                    createdRemoteVncIds,
                    updatedRemoteVncIds,
                    deletedRemoteVncIds,
                    tenantId: command.tenantId,
                }),
            );

            return {
                createdRemoteVncIds,
                updatedRemoteVncIds,
                deletedRemoteVncIds,
            };
        } catch (error) {
            this.eventBus.publish(
                new RemoteVncsSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async syncBTToDbRemoteVncsPerPage(
        transactionId: string,
        tenantId: number,
        pageNumber: number,
        createdRemoteVncIds: number[],
        updatedRemoteVncIds: number[],
    ) {
        // Retrieve remote vncs from BeyondTrust
        const btRemoteVncs = await this.queryBus.execute<RetrieveRemoteVncsQuery, RemoteVncRetrievedDtoOutput[]>(
            new RetrieveRemoteVncsQuery(transactionId, tenantId, this.appConfigService.sync.maxBatchSize, pageNumber),
        );

        // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
        if (
            ObjectUtility.contain(
                [...createdRemoteVncIds, ...updatedRemoteVncIds],
                btRemoteVncs.map((group) => group.id),
            )
        ) {
            return;
        }

        // Retrieve existing remote vncs from the DB using BeyondTrust remote vnc IDs
        const dbRemoteVncs = await this.remoteVncRepositoryService.findByIds(
            tenantId,
            btRemoteVncs.map((remoteVnc) => remoteVnc.id).filter((id) => id !== undefined),
        );

        const remoteVncsToBeCreated = this.findAllRemoteVncsToBeCreated(btRemoteVncs, dbRemoteVncs);
        const remoteVncsToBeUpdated = this.findAllRemoteVncsToBeUpdatedOrUpdateLastSyncDate(btRemoteVncs, dbRemoteVncs);

        const createdRemoteVncs = await this.createOrUpdateByIds(transactionId, tenantId, remoteVncsToBeCreated);
        const updatedRemoteVncs = await this.createOrUpdateByIds(transactionId, tenantId, remoteVncsToBeUpdated);

        // Collect created and updated remote vnc IDs
        createdRemoteVncIds.push(...createdRemoteVncs.map((remoteVnc) => remoteVnc.id));
        updatedRemoteVncIds.push(...updatedRemoteVncs.map((remoteVnc) => remoteVnc.id));

        if (btRemoteVncs.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncBTToDbRemoteVncsPerPage(
            transactionId,
            tenantId,
            pageNumber + 1,
            createdRemoteVncIds,
            updatedRemoteVncIds,
        );
    }

    private async syncDbToBTRemoteVncsPerPage(
        tenantId: number,
        pageNumber: number,
        dateBeforeSyncingBTRemoteVncs: Date,
        deletedRemoteVncIds: number[],
    ) {
        const dbRemoteVncs = await this.remoteVncRepositoryService.findByLastSyncDateBefore(
            tenantId,
            dateBeforeSyncingBTRemoteVncs,
            pageNumber,
            this.appConfigService.sync.maxBatchSize,
        );
        const remoteVncIds = dbRemoteVncs.map((dbRemoteVnc) => dbRemoteVnc.id);

        if (remoteVncIds.length > 0) {
            await this.remoteVncRepositoryService.deleteByIds(tenantId, remoteVncIds);
        }

        // Collect deleted remote vnc IDs
        deletedRemoteVncIds.push(...remoteVncIds);

        if (dbRemoteVncs.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncDbToBTRemoteVncsPerPage(
            tenantId,
            pageNumber + 1,
            dateBeforeSyncingBTRemoteVncs,
            deletedRemoteVncIds,
        );
    }

    private findAllRemoteVncsToBeCreated(btRemoteVncs: RemoteVncRetrievedDtoOutput[], dbRemoteVncs: RemoteVncEntity[]) {
        return btRemoteVncs
            .filter((btRemoteVnc) => !dbRemoteVncs.some((dbRemoteVnc) => dbRemoteVnc.id === btRemoteVnc.id))
            .map((btRemoteVnc) => this.createRemoteVncEntity(btRemoteVnc));
    }

    private findAllRemoteVncsToBeUpdatedOrUpdateLastSyncDate(
        btRemoteVncs: RemoteVncRetrievedDtoOutput[],
        dbRemoteVncs: RemoteVncEntity[],
    ) {
        return btRemoteVncs
            .filter((btRemoteVnc) => dbRemoteVncs.find((dbRemoteVnc) => dbRemoteVnc.id === btRemoteVnc.id))
            .map((btRemoteVnc) => this.createRemoteVncEntity(btRemoteVnc));
    }

    private createRemoteVncEntity(btRemoteVnc: RemoteVncRetrievedDtoOutput) {
        return RemoteVncEntity.create(
            btRemoteVnc.id,
            btRemoteVnc.name,
            btRemoteVnc.jumpointId,
            btRemoteVnc.hostname,
            btRemoteVnc.port,
            btRemoteVnc.jumpGroupId,
            btRemoteVnc.jumpGroupType ? mapFromBTJumpGroupType(btRemoteVnc.jumpGroupType) : undefined,
            btRemoteVnc.tag,
            btRemoteVnc.comments,
            btRemoteVnc.jumpPolicyId,
            btRemoteVnc.sessionPolicyId,
        );
    }

    private async createOrUpdateByIds(
        transactionId: string,
        tenantId: number,
        remoteVncs: RemoteVncEntity[],
    ): Promise<RemoteVncEntity[]> {
        const createdOrUpdatedEntities: RemoteVncEntity[] = [];

        if (remoteVncs.length === 0) {
            return createdOrUpdatedEntities;
        }

        for (const remoteVnc of remoteVncs) {
            try {
                await this.remoteVncRepositoryService.createOrUpdateById(tenantId, remoteVnc);
                createdOrUpdatedEntities.push(remoteVnc);
            } catch (error) {
                this.eventBus.publish(
                    new RemoteVncsSyncFailedEvent(transactionId, {
                        errorMessage: `Error syncing remote VNC with id ${remoteVnc.id}. Error: ${ErrorProcessorUtility.stringify(error)}`,
                        tenantId: tenantId,
                    }),
                );
            }
        }

        return createdOrUpdatedEntities;
    }
}
