import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { JumpClientInstallerRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import {
    RetrieveJumpClientInstallerByIdQuery,
    RetrieveJumpClientInstallersQuery,
} from '../../../beyondtrust-pra-conf-api/jump-client/queries';
import { DateUtility, ErrorProcessorUtility, ObjectUtility } from '../../../shared/utilities';
import { JumpClientInstallersSyncedEvent, JumpClientInstallersSyncFailedEvent } from '../../events';
import {
    mapFromBTJumpClientConnectionType,
    mapFromBTJumpClientGroupType,
    mapFromBTJumpClientInstallerKeyInfo,
} from '../../mappers';
import { JumpClientInstallersSyncResult } from '../../models';
import { JumpClientInstallerEntity } from '../../repositories/entities';
import { JumpClientInstallerRepositoryService } from '../../repositories/services/jump-client-installer-repository.service';
import { SyncJumpClientInstallersCommand } from '../sync-jump-client-installers.command';

@CommandHandler(SyncJumpClientInstallersCommand)
export class SyncJumpClientInstallersCommandHandler implements ICommandHandler<SyncJumpClientInstallersCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly jumpClientInstallerRepositoryService: JumpClientInstallerRepositoryService,
    ) {}

    public async execute(command: SyncJumpClientInstallersCommand): Promise<JumpClientInstallersSyncResult> {
        try {
            const startSyncUtcDate = DateUtility.getCurrentUtcDate();

            const createdJumpClientInstallerIds: number[] = [];
            const updatedJumpClientInstallerIds: number[] = [];
            const deletedJumpClientInstallerIds: number[] = [];

            await this.syncBTToDbJumpClientInstallersPerPage(
                command.transactionId,
                command.tenantId,
                1,
                createdJumpClientInstallerIds,
                updatedJumpClientInstallerIds,
            );
            await this.syncDbToBTJumpClientInstallersPerPage(
                command.tenantId,
                1,
                startSyncUtcDate,
                deletedJumpClientInstallerIds,
            );

            this.eventBus.publish(
                new JumpClientInstallersSyncedEvent(command.transactionId, {
                    createdJumpClientInstallerIds,
                    updatedJumpClientInstallerIds,
                    deletedJumpClientInstallerIds,
                    tenantId: command.tenantId,
                }),
            );

            return {
                createdJumpClientInstallerIds,
                updatedJumpClientInstallerIds,
                deletedJumpClientInstallerIds,
            };
        } catch (error) {
            this.eventBus.publish(
                new JumpClientInstallersSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async syncBTToDbJumpClientInstallersPerPage(
        transactionId: string,
        tenantId: number,
        pageNumber: number,
        createdJumpClientInstallerIds: number[],
        updatedJumpClientInstallerIds: number[],
    ) {
        // Retrieve jump client installers from BeyondTrust
        const btJumpClientInstallers = await this.queryBus.execute<
            RetrieveJumpClientInstallersQuery,
            JumpClientInstallerRetrievedDtoOutput[]
        >(new RetrieveJumpClientInstallersQuery(transactionId, this.appConfigService.sync.maxBatchSize, pageNumber));

        // Populate keyInfo for each jump client installer since the previous query does not include it.
        for (const btJumpClientInstaller of btJumpClientInstallers) {
            const moreDetailedBTJumpClientInstaller = await this.queryBus.execute<
                RetrieveJumpClientInstallerByIdQuery,
                JumpClientInstallerRetrievedDtoOutput
            >(new RetrieveJumpClientInstallerByIdQuery(transactionId, btJumpClientInstaller.id));

            btJumpClientInstaller.keyInfo = moreDetailedBTJumpClientInstaller.keyInfo;
        }

        // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
        if (
            ObjectUtility.contain(
                [...createdJumpClientInstallerIds, ...updatedJumpClientInstallerIds],
                btJumpClientInstallers.map((jumpClientInstaller) => jumpClientInstaller.id),
            )
        ) {
            return;
        }

        // Retrieve existing jump client installers from the DB using BeyondTrust jump client installer IDs
        const dbJumpClientInstallers = await this.jumpClientInstallerRepositoryService.findByIds(
            tenantId,
            btJumpClientInstallers
                .map((jumpClientInstaller) => jumpClientInstaller.id)
                .filter((id) => id !== undefined),
        );

        const jumpClientInstallersToBeCreated = this.findAllJumpClientInstallersToBeCreated(
            btJumpClientInstallers,
            dbJumpClientInstallers,
        );
        const jumpClientInstallersToBeUpdated = this.findAllJumpClientInstallersToBeUpdatedOrUpdateLastSyncDate(
            btJumpClientInstallers,
            dbJumpClientInstallers,
        );

        if (jumpClientInstallersToBeCreated.length > 0) {
            await this.jumpClientInstallerRepositoryService.createOrUpdateByIds(
                tenantId,
                jumpClientInstallersToBeCreated,
            );
        }

        if (jumpClientInstallersToBeUpdated.length > 0) {
            await this.jumpClientInstallerRepositoryService.createOrUpdateByIds(
                tenantId,
                jumpClientInstallersToBeUpdated,
            );
        }

        // Collect created and updated jump client installer IDs
        createdJumpClientInstallerIds.push(
            ...jumpClientInstallersToBeCreated.map((jumpClientInstaller) => jumpClientInstaller.id),
        );
        updatedJumpClientInstallerIds.push(
            ...jumpClientInstallersToBeUpdated.map((jumpClientInstaller) => jumpClientInstaller.id),
        );

        if (btJumpClientInstallers.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncBTToDbJumpClientInstallersPerPage(
            transactionId,
            tenantId,
            pageNumber + 1,
            createdJumpClientInstallerIds,
            updatedJumpClientInstallerIds,
        );
    }

    private async syncDbToBTJumpClientInstallersPerPage(
        tenantId: number,
        pageNumber: number,
        dateBeforeSyncingBTJumpClientInstallers: Date,
        deletedJumpClientInstallerIds: number[],
    ) {
        const dbJumpClientInstallers = await this.jumpClientInstallerRepositoryService.findByLastSyncDateBefore(
            tenantId,
            dateBeforeSyncingBTJumpClientInstallers,
            pageNumber,
            this.appConfigService.sync.maxBatchSize,
        );
        const jumpClientInstallerIds = dbJumpClientInstallers.map((dbJumpClientInstaller) => dbJumpClientInstaller.id);

        if (jumpClientInstallerIds.length > 0) {
            await this.jumpClientInstallerRepositoryService.deleteByIds(tenantId, jumpClientInstallerIds);
        }

        // Collect deleted jump client installer IDs
        deletedJumpClientInstallerIds.push(...jumpClientInstallerIds);

        if (dbJumpClientInstallers.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncDbToBTJumpClientInstallersPerPage(
            tenantId,
            pageNumber + 1,
            dateBeforeSyncingBTJumpClientInstallers,
            deletedJumpClientInstallerIds,
        );
    }

    private findAllJumpClientInstallersToBeCreated(
        btJumpClientInstallers: JumpClientInstallerRetrievedDtoOutput[],
        dbJumpClientInstallers: JumpClientInstallerEntity[],
    ) {
        return btJumpClientInstallers
            .filter(
                (btJumpClientInstaller) =>
                    !dbJumpClientInstallers.some(
                        (dbJumpClientInstaller) => dbJumpClientInstaller.id === btJumpClientInstaller.id,
                    ),
            )
            .map((btJumpClientInstaller) => this.createJumpClientInstallerEntity(btJumpClientInstaller));
    }

    private findAllJumpClientInstallersToBeUpdatedOrUpdateLastSyncDate(
        btJumpClientInstallers: JumpClientInstallerRetrievedDtoOutput[],
        dbJumpClientInstallers: JumpClientInstallerEntity[],
    ) {
        return btJumpClientInstallers
            .filter((btJumpClientInstaller) =>
                dbJumpClientInstallers.find(
                    (dbJumpClientInstaller) => dbJumpClientInstaller.id === btJumpClientInstaller.id,
                ),
            )
            .map((btJumpClientInstaller) => this.createJumpClientInstallerEntity(btJumpClientInstaller));
    }

    private createJumpClientInstallerEntity(btJumpClient: JumpClientInstallerRetrievedDtoOutput) {
        return JumpClientInstallerEntity.create(
            btJumpClient.id,
            btJumpClient.jumpGroupId,
            btJumpClient.jumpGroupType ? mapFromBTJumpClientGroupType(btJumpClient.jumpGroupType) : undefined,
            btJumpClient.name,
            btJumpClient.tag,
            btJumpClient.comments,
            btJumpClient.jumpPolicyId,
            btJumpClient.sessionPolicyId,
            btJumpClient.connectionType ? mapFromBTJumpClientConnectionType(btJumpClient.connectionType) : undefined,
            btJumpClient.expirationTimestamp,
            btJumpClient.maxOfflineMinutes,
            btJumpClient.elevateInstall,
            btJumpClient.elevatePrompt,
            btJumpClient.allowOverrideJumpGroup,
            btJumpClient.allowOverrideJumpPolicy,
            btJumpClient.allowOverrideName,
            btJumpClient.allowOverrideTag,
            btJumpClient.allowOverrideComments,
            btJumpClient.allowOverrideSessionPolicy,
            btJumpClient.installerId,
            btJumpClient.keyInfo ? mapFromBTJumpClientInstallerKeyInfo(btJumpClient.keyInfo) : undefined,
            btJumpClient.jumpointProxy,
        );
    }
}
