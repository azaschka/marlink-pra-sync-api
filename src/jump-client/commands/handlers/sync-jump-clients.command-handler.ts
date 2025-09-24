import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { JumpClientRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import { RetrieveJumpClientsQuery } from '../../../beyondtrust-pra-conf-api/jump-client/queries';
import { DateUtility, ErrorProcessorUtility, ObjectUtility } from '../../../shared/utilities';
import { JumpClientsSyncedEvent, JumpClientsSyncFailedEvent } from '../../events';
import {
    mapFromBTJumpClientConnectionType,
    mapFromBTJumpClientEndpointAgreementPolicyType,
    mapFromBTJumpClientGroupType,
    mapFromBTJumpClientInstallMode,
    mapFromBTJumpClientUnavailableReasonType,
} from '../../mappers';
import { JumpClientsSyncResult } from '../../models';
import { JumpClientEntity } from '../../repositories/entities';
import { JumpClientRepositoryService } from '../../repositories/services/jump-client-repository.service';
import { SyncJumpClientsCommand } from '../sync-jump-clients.command';

@CommandHandler(SyncJumpClientsCommand)
export class SyncJumpClientsCommandHandler implements ICommandHandler<SyncJumpClientsCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly jumpClientRepositoryService: JumpClientRepositoryService,
    ) {}

    public async execute(command: SyncJumpClientsCommand): Promise<JumpClientsSyncResult> {
        try {
            const startSyncUtcDate = DateUtility.getCurrentUtcDate();

            const createdJumpClientIds: number[] = [];
            const updatedJumpClientIds: number[] = [];
            const deletedJumpClientIds: number[] = [];

            await this.syncBTToDbJumpClientsPerPage(
                command.transactionId,
                command.tenantId,
                1,
                createdJumpClientIds,
                updatedJumpClientIds,
            );
            await this.syncDbToBTJumpClientsPerPage(command.tenantId, 1, startSyncUtcDate, deletedJumpClientIds);

            this.eventBus.publish(
                new JumpClientsSyncedEvent(command.transactionId, {
                    createdJumpClientIds,
                    updatedJumpClientIds,
                    deletedJumpClientIds,
                    tenantId: command.tenantId,
                }),
            );

            return {
                createdJumpClientIds,
                updatedJumpClientIds,
                deletedJumpClientIds,
            };
        } catch (error) {
            this.eventBus.publish(
                new JumpClientsSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async syncBTToDbJumpClientsPerPage(
        transactionId: string,
        tenantId: number,
        pageNumber: number,
        createdJumpClientIds: number[],
        updatedJumpClientIds: number[],
    ) {
        // Retrieve jump clients from BeyondTrust
        const btJumpClients = await this.queryBus.execute<RetrieveJumpClientsQuery, JumpClientRetrievedDtoOutput[]>(
            new RetrieveJumpClientsQuery(transactionId, this.appConfigService.sync.maxBatchSize, pageNumber),
        );

        // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
        if (
            ObjectUtility.contain(
                [...createdJumpClientIds, ...updatedJumpClientIds],
                btJumpClients.map((jumpClient) => jumpClient.id),
            )
        ) {
            return;
        }

        // Retrieve existing jump clients from the DB using BeyondTrust jump client IDs
        const dbJumpClients = await this.jumpClientRepositoryService.findByIds(
            tenantId,
            btJumpClients.map((jumpClient) => jumpClient.id).filter((id) => id !== undefined),
        );

        const jumpClientsToBeCreated = this.findAllJumpClientsToBeCreated(btJumpClients, dbJumpClients);
        const jumpClientsToBeUpdated = this.findAllJumpClientsToBeUpdatedOrUpdateLastSyncDate(
            btJumpClients,
            dbJumpClients,
        );

        const createdJumpClients = await this.createOrUpdateByIds(transactionId, tenantId, jumpClientsToBeCreated);
        const updatedJumpClients = await this.createOrUpdateByIds(transactionId, tenantId, jumpClientsToBeUpdated);

        // Collect created and updated jump client IDs
        createdJumpClientIds.push(...createdJumpClients.map((jumpClient) => jumpClient.id));
        updatedJumpClientIds.push(...updatedJumpClients.map((jumpClient) => jumpClient.id));

        if (btJumpClients.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncBTToDbJumpClientsPerPage(
            transactionId,
            tenantId,
            pageNumber + 1,
            createdJumpClientIds,
            updatedJumpClientIds,
        );
    }

    private async syncDbToBTJumpClientsPerPage(
        tenantId: number,
        pageNumber: number,
        dateBeforeSyncingBTJumpClients: Date,
        deletedJumpClientIds: number[],
    ) {
        const dbJumpClients = await this.jumpClientRepositoryService.findByLastSyncDateBefore(
            tenantId,
            dateBeforeSyncingBTJumpClients,
            pageNumber,
            this.appConfigService.sync.maxBatchSize,
        );
        const jumpClientIds = dbJumpClients.map((dbJumpClient) => dbJumpClient.id);

        if (jumpClientIds.length > 0) {
            await this.jumpClientRepositoryService.deleteByIds(tenantId, jumpClientIds);
        }

        // Collect deleted jump client IDs
        deletedJumpClientIds.push(...jumpClientIds);

        if (dbJumpClients.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncDbToBTJumpClientsPerPage(
            tenantId,
            pageNumber + 1,
            dateBeforeSyncingBTJumpClients,
            deletedJumpClientIds,
        );
    }

    private findAllJumpClientsToBeCreated(
        btJumpClients: JumpClientRetrievedDtoOutput[],
        dbJumpClients: JumpClientEntity[],
    ) {
        return btJumpClients
            .filter((btJumpClient) => !dbJumpClients.some((dbJumpClient) => dbJumpClient.id === btJumpClient.id))
            .map((btJumpClient) => this.createJumpClientEntity(btJumpClient));
    }

    private findAllJumpClientsToBeUpdatedOrUpdateLastSyncDate(
        btJumpClients: JumpClientRetrievedDtoOutput[],
        dbJumpClients: JumpClientEntity[],
    ) {
        return btJumpClients
            .filter((btJumpClient) => dbJumpClients.find((dbJumpClient) => dbJumpClient.id === btJumpClient.id))
            .map((btJumpClient) => this.createJumpClientEntity(btJumpClient));
    }

    private createJumpClientEntity(btJumpClient: JumpClientRetrievedDtoOutput) {
        return JumpClientEntity.create(
            btJumpClient.id,
            btJumpClient.jumpGroupId,
            btJumpClient.jumpGroupType ? mapFromBTJumpClientGroupType(btJumpClient.jumpGroupType) : undefined,
            btJumpClient.name,
            btJumpClient.hostname,
            btJumpClient.fqdn,
            btJumpClient.tag,
            btJumpClient.comments,
            btJumpClient.jumpPolicyId,
            btJumpClient.sessionPolicyId,
            btJumpClient.installMode ? mapFromBTJumpClientInstallMode(btJumpClient.installMode) : undefined,
            btJumpClient.connectionType ? mapFromBTJumpClientConnectionType(btJumpClient.connectionType) : undefined,
            btJumpClient.lastConnectTimestamp,
            btJumpClient.lastDisconnectTimestamp,
            btJumpClient.isLost,
            btJumpClient.needsUpdate,
            btJumpClient.unavailableReason
                ? mapFromBTJumpClientUnavailableReasonType(btJumpClient.unavailableReason)
                : undefined,
            btJumpClient.operatingSystem,
            btJumpClient.publicIp,
            btJumpClient.privateIp,
            btJumpClient.consoleUser,
            btJumpClient.expirationTimestamp,
            btJumpClient.maxOfflineMinutes,
            btJumpClient.lastAccessTimestamp,
            btJumpClient.endpointAgreementPolicy
                ? mapFromBTJumpClientEndpointAgreementPolicyType(btJumpClient.endpointAgreementPolicy)
                : undefined,
            btJumpClient.jumpointProxy,
        );
    }

    private async createOrUpdateByIds(
        transactionId: string,
        tenantId: number,
        jumpClients: JumpClientEntity[],
    ): Promise<JumpClientEntity[]> {
        const createdOrUpdatedEntities: JumpClientEntity[] = [];

        if (jumpClients.length === 0) {
            return createdOrUpdatedEntities;
        }

        for (const jumpClient of jumpClients) {
            try {
                await this.jumpClientRepositoryService.createOrUpdateById(tenantId, jumpClient);
                createdOrUpdatedEntities.push(jumpClient);
            } catch (error) {
                this.eventBus.publish(
                    new JumpClientsSyncFailedEvent(transactionId, {
                        errorMessage: `Error syncing jump client with id ${jumpClient.id}. Error: ${ErrorProcessorUtility.stringify(error)}`,
                        tenantId: tenantId,
                    }),
                );
            }
        }

        return createdOrUpdatedEntities;
    }
}
