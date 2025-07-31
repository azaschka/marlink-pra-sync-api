import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { ShellJumpRetrievedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/dtos/outputs';
import { RetrieveShellJumpsQuery } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/queries';
import { DateUtility, ErrorProcessorUtility, ObjectUtility } from '../../../../shared/utilities';
import { ShellJumpsSyncedEvent, ShellJumpsSyncFailedEvent } from '../../events';
import { mapFromBTJumpGroupType, mapFromBTShellJumpProtocolType, mapFromBTShellJumpTerminalType } from '../../mappers';
import { ShellJumpsSyncResult } from '../../models';
import { ShellJumpEntity } from '../../repositories/entities';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { SyncShellJumpsCommand } from '../sync-shell-jumps.command';

@CommandHandler(SyncShellJumpsCommand)
export class SyncShellJumpsCommandHandler implements ICommandHandler<SyncShellJumpsCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly shellJumpRepositoryService: ShellJumpRepositoryService,
    ) {}

    public async execute(command: SyncShellJumpsCommand): Promise<ShellJumpsSyncResult> {
        try {
            const startSyncUtcDate = DateUtility.getCurrentUtcDate();

            const createdShellJumpIds: number[] = [];
            const updatedShellJumpIds: number[] = [];
            const deletedShellJumpIds: number[] = [];

            await this.syncBTToDbShellJumpsPerPage(command.transactionId, 1, createdShellJumpIds, updatedShellJumpIds);
            await this.syncDbToBTShellJumpsPerPage(1, startSyncUtcDate, deletedShellJumpIds);

            this.eventBus.publish(
                new ShellJumpsSyncedEvent(command.transactionId, {
                    createdShellJumpIds,
                    updatedShellJumpIds,
                    deletedShellJumpIds,
                }),
            );

            return {
                createdShellJumpIds,
                updatedShellJumpIds,
                deletedShellJumpIds,
            };
        } catch (error) {
            this.eventBus.publish(
                new ShellJumpsSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                }),
            );

            throw error;
        }
    }

    private async syncBTToDbShellJumpsPerPage(
        transactionId: string,
        pageNumber: number,
        createdShellJumpIds: number[],
        updatedShellJumpIds: number[],
    ) {
        // Retrieve shell jumps from BeyondTrust
        const btShellJumps = await this.queryBus.execute<RetrieveShellJumpsQuery, ShellJumpRetrievedDtoOutput[]>(
            new RetrieveShellJumpsQuery(transactionId, this.appConfigService.sync.maxBatchSize, pageNumber),
        );

        // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
        if (
            ObjectUtility.contain(
                [...createdShellJumpIds, ...updatedShellJumpIds],
                btShellJumps.map((group) => group.id),
            )
        ) {
            return;
        }

        // Retrieve existing shell jumps from the DB using BeyondTrust shell jump IDs
        const dbShellJumps = await this.shellJumpRepositoryService.findByIds(
            btShellJumps.map((shellJump) => shellJump.id).filter((id) => id !== undefined),
        );

        const shellJumpsToBeCreated = this.findAllShellJumpsToBeCreated(btShellJumps, dbShellJumps);
        const shellJumpsToBeUpdated = this.findAllShellJumpsToBeUpdatedOrUpdateLastSyncDate(btShellJumps, dbShellJumps);

        const createdShellJumps = await this.createOrUpdateByIds(transactionId, shellJumpsToBeCreated);
        const updatedShellJumps = await this.createOrUpdateByIds(transactionId, shellJumpsToBeUpdated);

        // Collect created and updated shell jump IDs
        createdShellJumpIds.push(...createdShellJumps.map((shellJump) => shellJump.id));
        updatedShellJumpIds.push(...updatedShellJumps.map((shellJump) => shellJump.id));

        if (btShellJumps.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncBTToDbShellJumpsPerPage(transactionId, pageNumber + 1, createdShellJumpIds, updatedShellJumpIds);
    }

    private async syncDbToBTShellJumpsPerPage(
        pageNumber: number,
        dateBeforeSyncingBTShellJumps: Date,
        deletedShellJumpIds: number[],
    ) {
        const dbShellJumps = await this.shellJumpRepositoryService.findByLastSyncDateBefore(
            dateBeforeSyncingBTShellJumps,
            pageNumber,
            this.appConfigService.sync.maxBatchSize,
        );
        const shellJumpIds = dbShellJumps.map((dbShellJump) => dbShellJump.id);

        if (shellJumpIds.length > 0) {
            await this.shellJumpRepositoryService.deleteByIds(shellJumpIds);
        }

        // Collect deleted shell jump IDs
        deletedShellJumpIds.push(...shellJumpIds);

        if (dbShellJumps.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncDbToBTShellJumpsPerPage(pageNumber + 1, dateBeforeSyncingBTShellJumps, deletedShellJumpIds);
    }

    private findAllShellJumpsToBeCreated(btShellJumps: ShellJumpRetrievedDtoOutput[], dbShellJumps: ShellJumpEntity[]) {
        return btShellJumps
            .filter((btShellJump) => !dbShellJumps.some((dbShellJump) => dbShellJump.id === btShellJump.id))
            .map((btShellJump) => this.createShellJumpEntity(btShellJump));
    }

    private findAllShellJumpsToBeUpdatedOrUpdateLastSyncDate(
        btShellJumps: ShellJumpRetrievedDtoOutput[],
        dbShellJumps: ShellJumpEntity[],
    ) {
        return btShellJumps
            .filter((btShellJump) => dbShellJumps.find((dbShellJump) => dbShellJump.id === btShellJump.id))
            .map((btShellJump) => this.createShellJumpEntity(btShellJump));
    }

    private createShellJumpEntity(btShellJump: ShellJumpRetrievedDtoOutput) {
        return ShellJumpEntity.create(
            btShellJump.id,
            btShellJump.name,
            btShellJump.jumpointId,
            btShellJump.hostname,
            mapFromBTShellJumpProtocolType(btShellJump.protocol),
            btShellJump.port,
            btShellJump.jumpGroupId,
            btShellJump.jumpGroupType ? mapFromBTJumpGroupType(btShellJump.jumpGroupType) : undefined,
            btShellJump.terminal ? mapFromBTShellJumpTerminalType(btShellJump.terminal) : undefined,
            btShellJump.keepAlive,
            btShellJump.tag,
            btShellJump.comments,
            btShellJump.jumpPolicyId,
            btShellJump.username,
            btShellJump.sessionPolicyId,
        );
    }

    private async createOrUpdateByIds(
        transactionId: string,
        shellJumps: ShellJumpEntity[],
    ): Promise<ShellJumpEntity[]> {
        const createdOrUpdatedEntities: ShellJumpEntity[] = [];

        if (shellJumps.length === 0) {
            return createdOrUpdatedEntities;
        }

        for (const shellJump of shellJumps) {
            try {
                await this.shellJumpRepositoryService.createOrUpdateById(shellJump);
                createdOrUpdatedEntities.push(shellJump);
            } catch (error) {
                this.eventBus.publish(
                    new ShellJumpsSyncFailedEvent(transactionId, {
                        errorMessage: `Error syncing shell jump with id ${shellJump.id}. Error: ${ErrorProcessorUtility.stringify(error)}`,
                    }),
                );
            }
        }

        return createdOrUpdatedEntities;
    }
}
