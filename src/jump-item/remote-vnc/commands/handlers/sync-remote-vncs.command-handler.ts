import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { RemoteVncRetrievedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/dtos/outputs';
import { RetrieveRemoteVncsQuery } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/queries';
import { DateUtility, ErrorProcessorUtility, ObjectUtility } from '../../../../shared/utilities';
import { RemoteVncsSyncedEvent, RemoteVncsSyncFailedEvent } from '../../events';
import { mapFromBTJumpGroupType } from '../../mappers';
import { RemoteVncsSyncResult } from '../../models';
import { RemoteVncEntity } from '../../repositories/entities';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
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

            await this.syncBTToDbRemoteVncsPerPage(command.transactionId, 1, createdRemoteVncIds, updatedRemoteVncIds);
            await this.syncDbToBTRemoteVncsPerPage(1, startSyncUtcDate, deletedRemoteVncIds);

            this.eventBus.publish(
                new RemoteVncsSyncedEvent(command.transactionId, {
                    createdRemoteVncIds,
                    updatedRemoteVncIds,
                    deletedRemoteVncIds,
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
                }),
            );

            throw error;
        }
    }

    private async syncBTToDbRemoteVncsPerPage(
        transactionId: string,
        pageNumber: number,
        createdRemoteVncIds: number[],
        updatedRemoteVncIds: number[],
    ) {
        // Retrieve remote vncs from BeyondTrust
        const btRemoteVncs = await this.queryBus.execute<RetrieveRemoteVncsQuery, RemoteVncRetrievedDtoOutput[]>(
            new RetrieveRemoteVncsQuery(transactionId, this.appConfigService.sync.maxBatchSize, pageNumber),
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
            btRemoteVncs.map((remoteVnc) => remoteVnc.id).filter((id) => id !== undefined),
        );

        const remoteVncsToBeCreated = this.findAllRemoteVncsToBeCreated(btRemoteVncs, dbRemoteVncs);
        const remoteVncsToBeUpdated = this.findAllRemoteVncsToBeUpdatedOrUpdateLastSyncDate(btRemoteVncs, dbRemoteVncs);

        const createdRemoteVncs = await this.createOrUpdateByIds(transactionId, remoteVncsToBeCreated);
        const updatedRemoteVncs = await this.createOrUpdateByIds(transactionId, remoteVncsToBeUpdated);

        // Collect created and updated remote vnc IDs
        createdRemoteVncIds.push(...createdRemoteVncs.map((remoteVnc) => remoteVnc.id));
        updatedRemoteVncIds.push(...updatedRemoteVncs.map((remoteVnc) => remoteVnc.id));

        if (btRemoteVncs.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncBTToDbRemoteVncsPerPage(transactionId, pageNumber + 1, createdRemoteVncIds, updatedRemoteVncIds);
    }

    private async syncDbToBTRemoteVncsPerPage(
        pageNumber: number,
        dateBeforeSyncingBTRemoteVncs: Date,
        deletedRemoteVncIds: number[],
    ) {
        const dbRemoteVncs = await this.remoteVncRepositoryService.findByLastSyncDateBefore(
            dateBeforeSyncingBTRemoteVncs,
            pageNumber,
            this.appConfigService.sync.maxBatchSize,
        );
        const remoteVncIds = dbRemoteVncs.map((dbRemoteVnc) => dbRemoteVnc.id);

        if (remoteVncIds.length > 0) {
            await this.remoteVncRepositoryService.deleteByIds(remoteVncIds);
        }

        // Collect deleted remote vnc IDs
        deletedRemoteVncIds.push(...remoteVncIds);

        if (dbRemoteVncs.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncDbToBTRemoteVncsPerPage(pageNumber + 1, dateBeforeSyncingBTRemoteVncs, deletedRemoteVncIds);
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
        remoteVncs: RemoteVncEntity[],
    ): Promise<RemoteVncEntity[]> {
        const createdOrUpdatedEntities: RemoteVncEntity[] = [];

        if (remoteVncs.length === 0) {
            return createdOrUpdatedEntities;
        }

        for (const remoteVnc of remoteVncs) {
            try {
                await this.remoteVncRepositoryService.createOrUpdateById(remoteVnc);
                createdOrUpdatedEntities.push(remoteVnc);
            } catch (error) {
                this.eventBus.publish(
                    new RemoteVncsSyncFailedEvent(transactionId, {
                        errorMessage: `Error syncing remote VNC with id ${remoteVnc.id}. Error: ${ErrorProcessorUtility.stringify(error)}`,
                    }),
                );
            }
        }

        return createdOrUpdatedEntities;
    }
}
