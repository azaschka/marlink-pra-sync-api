import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { WebJumpRetrievedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/dtos/outputs';
import { RetrieveWebJumpsQuery } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/queries';
import { DateUtility, ErrorProcessorUtility, ObjectUtility } from '../../../../shared/utilities';
import { WebJumpsSyncedEvent, WebJumpsSyncFailedEvent } from '../../events';
import { mapFromBTJumpGroupType, mapFromBTWebJumpUsernameFormatType } from '../../mappers';
import { WebJumpsSyncResult } from '../../models';
import { WebJumpEntity } from '../../repositories/entities';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { SyncWebJumpsCommand } from '../sync-web-jumps.command';

@CommandHandler(SyncWebJumpsCommand)
export class SyncWebJumpsCommandHandler implements ICommandHandler<SyncWebJumpsCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly webJumpRepositoryService: WebJumpRepositoryService,
    ) {}

    public async execute(command: SyncWebJumpsCommand): Promise<WebJumpsSyncResult> {
        try {
            const startSyncUtcDate = DateUtility.getCurrentUtcDate();

            const createdWebJumpIds: number[] = [];
            const updatedWebJumpIds: number[] = [];
            const deletedWebJumpIds: number[] = [];

            await this.syncBTToDbWebJumpsPerPage(command.transactionId, 1, createdWebJumpIds, updatedWebJumpIds);
            await this.syncDbToBTWebJumpsPerPage(1, startSyncUtcDate, deletedWebJumpIds);

            this.eventBus.publish(
                new WebJumpsSyncedEvent(command.transactionId, {
                    createdWebJumpIds,
                    updatedWebJumpIds,
                    deletedWebJumpIds,
                }),
            );

            return {
                createdWebJumpIds,
                updatedWebJumpIds,
                deletedWebJumpIds,
            };
        } catch (error) {
            this.eventBus.publish(
                new WebJumpsSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                }),
            );

            throw error;
        }
    }

    private async syncBTToDbWebJumpsPerPage(
        transactionId: string,
        pageNumber: number,
        createdWebJumpIds: number[],
        updatedWebJumpIds: number[],
    ) {
        // Retrieve web jumps from BeyondTrust
        const btWebJumps = await this.queryBus.execute<RetrieveWebJumpsQuery, WebJumpRetrievedDtoOutput[]>(
            new RetrieveWebJumpsQuery(transactionId, this.appConfigService.sync.maxBatchSize, pageNumber),
        );

        // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
        if (
            ObjectUtility.contain(
                [...createdWebJumpIds, ...updatedWebJumpIds],
                btWebJumps.map((group) => group.id),
            )
        ) {
            return;
        }

        // Retrieve existing web jumps from the DB using BeyondTrust web jump IDs
        const dbWebJumps = await this.webJumpRepositoryService.findByIds(
            btWebJumps.map((webJump) => webJump.id).filter((id) => id !== undefined),
        );

        const webJumpsToBeCreated = this.findAllWebJumpsToBeCreated(btWebJumps, dbWebJumps);
        const webJumpsToBeUpdated = this.findAllWebJumpsToBeUpdatedOrUpdateLastSyncDate(btWebJumps, dbWebJumps);

        const createdWebJumps = await this.createOrUpdateByIds(transactionId, webJumpsToBeCreated);
        const updatedWebJumps = await this.createOrUpdateByIds(transactionId, webJumpsToBeUpdated);

        // Collect created and updated web jump IDs
        createdWebJumpIds.push(...createdWebJumps.map((webJump) => webJump.id));
        updatedWebJumpIds.push(...updatedWebJumps.map((webJump) => webJump.id));

        if (btWebJumps.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncBTToDbWebJumpsPerPage(transactionId, pageNumber + 1, createdWebJumpIds, updatedWebJumpIds);
    }

    private async syncDbToBTWebJumpsPerPage(
        pageNumber: number,
        dateBeforeSyncingBTWebJumps: Date,
        deletedWebJumpIds: number[],
    ) {
        const dbWebJumps = await this.webJumpRepositoryService.findByLastSyncDateBefore(
            dateBeforeSyncingBTWebJumps,
            pageNumber,
            this.appConfigService.sync.maxBatchSize,
        );
        const webJumpIds = dbWebJumps.map((dbWebJump) => dbWebJump.id);

        if (webJumpIds.length > 0) {
            await this.webJumpRepositoryService.deleteByIds(webJumpIds);
        }

        // Collect deleted web jump IDs
        deletedWebJumpIds.push(...webJumpIds);

        if (dbWebJumps.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncDbToBTWebJumpsPerPage(pageNumber + 1, dateBeforeSyncingBTWebJumps, deletedWebJumpIds);
    }

    private findAllWebJumpsToBeCreated(btWebJumps: WebJumpRetrievedDtoOutput[], dbWebJumps: WebJumpEntity[]) {
        return btWebJumps
            .filter((btWebJump) => !dbWebJumps.some((dbWebJump) => dbWebJump.id === btWebJump.id))
            .map((btWebJump) => this.createWebJumpEntity(btWebJump));
    }

    private findAllWebJumpsToBeUpdatedOrUpdateLastSyncDate(
        btWebJumps: WebJumpRetrievedDtoOutput[],
        dbWebJumps: WebJumpEntity[],
    ) {
        return btWebJumps
            .filter((btWebJump) => dbWebJumps.find((dbWebJump) => dbWebJump.id === btWebJump.id))
            .map((btWebJump) => this.createWebJumpEntity(btWebJump));
    }

    private createWebJumpEntity(btWebJump: WebJumpRetrievedDtoOutput) {
        return WebJumpEntity.create(
            btWebJump.id,
            btWebJump.name,
            btWebJump.jumpointId,
            btWebJump.url,
            btWebJump.jumpGroupId,
            btWebJump.jumpGroupType ? mapFromBTJumpGroupType(btWebJump.jumpGroupType) : undefined,
            btWebJump.usernameFormat ? mapFromBTWebJumpUsernameFormatType(btWebJump.usernameFormat) : undefined,
            btWebJump.verifyCertificate,
            btWebJump.authenticationTimeout,
            btWebJump.tag,
            btWebJump.comments,
            btWebJump.jumpPolicyId,
            btWebJump.usernameField,
            btWebJump.passwordField,
            btWebJump.submitField,
            btWebJump.sessionPolicyId,
        );
    }

    private async createOrUpdateByIds(transactionId: string, webJumps: WebJumpEntity[]): Promise<WebJumpEntity[]> {
        const createdOrUpdatedEntities: WebJumpEntity[] = [];

        if (webJumps.length === 0) {
            return createdOrUpdatedEntities;
        }

        for (const webJump of webJumps) {
            try {
                await this.webJumpRepositoryService.createOrUpdateById(webJump);
                createdOrUpdatedEntities.push(webJump);
            } catch (error) {
                this.eventBus.publish(
                    new WebJumpsSyncFailedEvent(transactionId, {
                        errorMessage: `Error syncing web jump with id ${webJump.id}. Error: ${ErrorProcessorUtility.stringify(error)}`,
                    }),
                );
            }
        }

        return createdOrUpdatedEntities;
    }
}
