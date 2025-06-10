import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { ProtocolTunnelJumpRetrievedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/dtos/outputs';
import { RetrieveProtocolTunnelJumpsQuery } from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/queries';
import { DateUtility, ErrorProcessorUtility, ObjectUtility } from '../../../../shared/utilities';
import { ProtocolTunnelJumpsSyncedEvent, ProtocolTunnelJumpsSyncFailedEvent } from '../../events';
import { mapFromBTJumpGroupType, mapFromBTTunnelType } from '../../mappers';
import { ProtocolTunnelJumpsSyncResult } from '../../models';
import { ProtocolTunnelJumpEntity } from '../../repositories/entities';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { SyncProtocolTunnelJumpsCommand } from '../sync-protocol-tunnel-jumps.command';

@CommandHandler(SyncProtocolTunnelJumpsCommand)
export class SyncProtocolTunnelJumpsCommandHandler implements ICommandHandler<SyncProtocolTunnelJumpsCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService,
    ) {}

    public async execute(command: SyncProtocolTunnelJumpsCommand): Promise<ProtocolTunnelJumpsSyncResult> {
        try {
            const startSyncUtcDate = DateUtility.getCurrentUtcDate();

            const createdProtocolTunnelJumpIds: number[] = [];
            const updatedProtocolTunnelJumpIds: number[] = [];
            const deletedProtocolTunnelJumpIds: number[] = [];

            await this.syncBTToDbProtocolTunnelJumpsPerPage(
                command.transactionId,
                1,
                createdProtocolTunnelJumpIds,
                updatedProtocolTunnelJumpIds,
            );
            await this.syncDbToBTProtocolTunnelJumpsPerPage(1, startSyncUtcDate, deletedProtocolTunnelJumpIds);

            this.eventBus.publish(
                new ProtocolTunnelJumpsSyncedEvent(command.transactionId, {
                    createdProtocolTunnelJumpIds,
                    updatedProtocolTunnelJumpIds,
                    deletedProtocolTunnelJumpIds,
                }),
            );

            return {
                createdProtocolTunnelJumpIds,
                updatedProtocolTunnelJumpIds,
                deletedProtocolTunnelJumpIds,
            };
        } catch (error) {
            this.eventBus.publish(
                new ProtocolTunnelJumpsSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                }),
            );

            throw error;
        }
    }

    private async syncBTToDbProtocolTunnelJumpsPerPage(
        transactionId: string,
        pageNumber: number,
        createdProtocolTunnelJumpIds: number[],
        updatedProtocolTunnelJumpIds: number[],
    ) {
        // Retrieve protocol tunnel jumps from BeyondTrust
        const btProtocolTunnelJumps = await this.queryBus.execute<
            RetrieveProtocolTunnelJumpsQuery,
            ProtocolTunnelJumpRetrievedDtoOutput[]
        >(new RetrieveProtocolTunnelJumpsQuery(transactionId, this.appConfigService.sync.maxBatchSize, pageNumber));

        // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
        if (
            ObjectUtility.contain(
                [...createdProtocolTunnelJumpIds, ...updatedProtocolTunnelJumpIds],
                btProtocolTunnelJumps.map((group) => group.id),
            )
        ) {
            return;
        }

        // Retrieve existing protocol tunnel jumps from the DB using BeyondTrust protocol tunnel jump IDs
        const dbProtocolTunnelJumps = await this.protocolTunnelJumpRepositoryService.findByIds(
            btProtocolTunnelJumps.map((protocolTunnelJump) => protocolTunnelJump.id).filter((id) => id !== undefined),
        );

        const protocolTunnelJumpsToBeCreated = this.findAllProtocolTunnelJumpsToBeCreated(
            btProtocolTunnelJumps,
            dbProtocolTunnelJumps,
        );
        const protocolTunnelJumpsToBeUpdated = this.findAllProtocolTunnelJumpsToBeUpdatedOrUpdateLastSyncDate(
            btProtocolTunnelJumps,
            dbProtocolTunnelJumps,
        );

        if (protocolTunnelJumpsToBeCreated.length > 0) {
            await this.protocolTunnelJumpRepositoryService.createOrUpdateByIds(protocolTunnelJumpsToBeCreated);
        }

        if (protocolTunnelJumpsToBeUpdated.length > 0) {
            await this.protocolTunnelJumpRepositoryService.createOrUpdateByIds(protocolTunnelJumpsToBeUpdated);
        }

        // Collect created and updated protocol tunnel jump IDs
        createdProtocolTunnelJumpIds.push(
            ...protocolTunnelJumpsToBeCreated.map((protocolTunnelJump) => protocolTunnelJump.id),
        );
        updatedProtocolTunnelJumpIds.push(
            ...protocolTunnelJumpsToBeUpdated.map((protocolTunnelJump) => protocolTunnelJump.id),
        );

        if (btProtocolTunnelJumps.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncBTToDbProtocolTunnelJumpsPerPage(
            transactionId,
            pageNumber + 1,
            createdProtocolTunnelJumpIds,
            updatedProtocolTunnelJumpIds,
        );
    }

    private async syncDbToBTProtocolTunnelJumpsPerPage(
        pageNumber: number,
        dateBeforeSyncingBTProtocolTunnelJumps: Date,
        deletedProtocolTunnelJumpIds: number[],
    ) {
        const dbProtocolTunnelJumps = await this.protocolTunnelJumpRepositoryService.findByLastSyncDateBefore(
            dateBeforeSyncingBTProtocolTunnelJumps,
            pageNumber,
            this.appConfigService.sync.maxBatchSize,
        );
        const protocolTunnelJumpIds = dbProtocolTunnelJumps.map((dbProtocolTunnelJump) => dbProtocolTunnelJump.id);

        if (protocolTunnelJumpIds.length > 0) {
            await this.protocolTunnelJumpRepositoryService.deleteByIds(protocolTunnelJumpIds);
        }

        // Collect deleted protocol tunnel jump IDs
        deletedProtocolTunnelJumpIds.push(...protocolTunnelJumpIds);

        if (dbProtocolTunnelJumps.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncDbToBTProtocolTunnelJumpsPerPage(
            pageNumber + 1,
            dateBeforeSyncingBTProtocolTunnelJumps,
            deletedProtocolTunnelJumpIds,
        );
    }

    private findAllProtocolTunnelJumpsToBeCreated(
        btProtocolTunnelJumps: ProtocolTunnelJumpRetrievedDtoOutput[],
        dbProtocolTunnelJumps: ProtocolTunnelJumpEntity[],
    ) {
        return btProtocolTunnelJumps
            .filter(
                (btProtocolTunnelJump) =>
                    !dbProtocolTunnelJumps.some(
                        (dbProtocolTunnelJump) => dbProtocolTunnelJump.id === btProtocolTunnelJump.id,
                    ),
            )
            .map((btProtocolTunnelJump) => this.createProtocolTunnelJumpEntity(btProtocolTunnelJump));
    }

    private findAllProtocolTunnelJumpsToBeUpdatedOrUpdateLastSyncDate(
        btProtocolTunnelJumps: ProtocolTunnelJumpRetrievedDtoOutput[],
        dbProtocolTunnelJumps: ProtocolTunnelJumpEntity[],
    ) {
        return btProtocolTunnelJumps
            .filter((btProtocolTunnelJump) =>
                dbProtocolTunnelJumps.find(
                    (dbProtocolTunnelJump) => dbProtocolTunnelJump.id === btProtocolTunnelJump.id,
                ),
            )
            .map((btProtocolTunnelJump) => this.createProtocolTunnelJumpEntity(btProtocolTunnelJump));
    }

    private createProtocolTunnelJumpEntity(btProtocolTunnelJump: ProtocolTunnelJumpRetrievedDtoOutput) {
        return ProtocolTunnelJumpEntity.create(
            btProtocolTunnelJump.id,
            btProtocolTunnelJump.name,
            btProtocolTunnelJump.jumpointId,
            btProtocolTunnelJump.hostname,
            btProtocolTunnelJump.jumpGroupId,
            btProtocolTunnelJump.jumpGroupType ? mapFromBTJumpGroupType(btProtocolTunnelJump.jumpGroupType) : undefined,
            btProtocolTunnelJump.tag,
            btProtocolTunnelJump.comments,
            btProtocolTunnelJump.jumpPolicyId,
            btProtocolTunnelJump.sessionPolicyId,
            btProtocolTunnelJump.tunnelListenAddress,
            btProtocolTunnelJump.tunnelDefinitions,
            btProtocolTunnelJump.tunnelType ? mapFromBTTunnelType(btProtocolTunnelJump.tunnelType) : undefined,
            btProtocolTunnelJump.username,
            btProtocolTunnelJump.database,
            btProtocolTunnelJump.url,
            btProtocolTunnelJump.caCertificates,
        );
    }
}
