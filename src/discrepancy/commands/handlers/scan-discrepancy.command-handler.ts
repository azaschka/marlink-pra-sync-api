import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { differenceBy, differenceWith, intersectionBy, intersectionWith, isEqual } from 'lodash';
import pLimit, { LimitFunction } from 'p-limit';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { GroupPolicyRetrievedDtoOutput as BTGroupPolicy } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { GroupPolicy as DBGroupPolicy } from '../../../group-policy/models';
import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import { DateUtility, ObjectUtility, PaginationUtility } from '../../../shared/utilities';
import { DiscrepancyScannedEvent } from '../../events';
import { DiscrepancyOverview } from '../../models';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { DiscrepancyStrategyProviderService } from '../../services/discrepancy-strategy-provider.service';
import { DiscrepancyStrategy } from '../../types';
import { ScanDiscrepancyCommand } from '../scan-discrepancy.command';

// Using GroupPolicy as representative type.
// TODO: Generalize for different discrepancy types.
type RepresentativeEntity = GroupPolicyEntity;
type BTRepresentative = BTGroupPolicy;
type DBRepresentative = DBGroupPolicy;

@CommandHandler(ScanDiscrepancyCommand)
export class ScanDiscrepancyCommandHandler implements ICommandHandler<ScanDiscrepancyCommand> {
    private readonly dbConnLimit: LimitFunction;

    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly discrepancyStrategyProviderService: DiscrepancyStrategyProviderService,
        private readonly discrepancyRepositoryService: DiscrepancyRepositoryService,
        private readonly eventBus: EventBus,
    ) {
        this.dbConnLimit = pLimit(this.appConfigService.databaseMaxConnections);
    }

    public async execute(command: ScanDiscrepancyCommand): Promise<DiscrepancyOverview> {
        const startSyncUtcDate = DateUtility.getCurrentUtcDate();

        const discrepancyStrategy = this.discrepancyStrategyProviderService.get(
            command.entityType,
        ) as DiscrepancyStrategy<BTRepresentative, DBRepresentative, RepresentativeEntity>;

        const btData = (
            await PaginationUtility.queryUntilDuplicatePage(
                (pageNumber: number) =>
                    discrepancyStrategy.btRetrieveFunc(
                        command.transactionId,
                        command.tenantId,
                        this.appConfigService.sync.maxBatchSize,
                        pageNumber,
                    ),
                discrepancyStrategy.btOmittedPropsForDuplicateCheck,
            )
        )
            .map((btData) => discrepancyStrategy.btToDbEntity(btData))
            .map((data) => ObjectUtility.stripProperties(data, ...discrepancyStrategy.trimmedProps))
            .map((data) => JSON.parse(JSON.stringify(data)) as RepresentativeEntity); // Remove undefined values and convert to plain object

        const dbData = (
            await PaginationUtility.queryUntilLastPage((pageNumber: number) =>
                discrepancyStrategy.dbRetrieveFunc(
                    command.transactionId,
                    command.tenantId,
                    this.appConfigService.sync.maxBatchSize,
                    pageNumber,
                ),
            )
        )
            .map((data) => ObjectUtility.stripProperties(data, ...discrepancyStrategy.trimmedProps))
            .map((data) => JSON.parse(JSON.stringify(data)) as RepresentativeEntity); // Remove undefined values and convert to plain object

        // 1. identical
        const identicalData = intersectionWith(btData, dbData, isEqual);

        // 2. remaining
        const remainingBtData = differenceWith(btData, identicalData, isEqual);
        const remainingDbData = differenceWith(dbData, identicalData, isEqual);

        // 3. only in one side
        const onlyInBt = differenceBy(remainingBtData, remainingDbData, 'id');
        const onlyInDb = differenceBy(remainingDbData, remainingBtData, 'id');

        // 4. different content
        const differentDataPairs = intersectionBy(remainingBtData, remainingDbData, 'id')
            .map((bt) => {
                const db = remainingDbData.find((d) => d.id === bt.id);
                return db && !isEqual(bt, db) ? { bt, db } : null;
            })
            .filter((pair) => pair !== null);

        // Mark identical data as synced
        await Promise.all(
            identicalData.map((data) =>
                this.dbConnLimit(() =>
                    discrepancyStrategy.dbMarkAsSyncedFunc(command.transactionId, command.tenantId, data),
                ),
            ),
        );

        // Handle data which only exist in BT
        await Promise.all(
            onlyInBt.map((bt) =>
                this.dbConnLimit(async () => {
                    const existingDiscrepancy = await this.discrepancyRepositoryService.findOneByEntityTypeAndEntityId(
                        command.tenantId,
                        command.entityType,
                        bt.id,
                    );

                    await this.discrepancyRepositoryService.createOrUpdateById(command.tenantId, {
                        id: existingDiscrepancy?.id,
                        entityType: command.entityType,
                        entityId: bt.id,
                        internalData: undefined,
                        externalData: bt as unknown as Record<string, unknown>,
                        lastModificationDate: DateUtility.getCurrentUtcDate(), // Force modification date to be updated
                    });
                }),
            ),
        );

        // Handle data which only exist in DB
        await Promise.all(
            onlyInDb.map((db) =>
                this.dbConnLimit(async () => {
                    const existingDiscrepancy = await this.discrepancyRepositoryService.findOneByEntityTypeAndEntityId(
                        command.tenantId,
                        command.entityType,
                        db.id,
                    );

                    await this.discrepancyRepositoryService.createOrUpdateById(command.tenantId, {
                        id: existingDiscrepancy?.id,
                        entityType: command.entityType,
                        entityId: db.id,
                        internalData: db as unknown as Record<string, unknown>,
                        externalData: undefined,
                        lastModificationDate: DateUtility.getCurrentUtcDate(), // Force modification date to be updated
                    });
                }),
            ),
        );

        // Handle data which have different content
        await Promise.all(
            differentDataPairs.map((pair) =>
                this.dbConnLimit(async () => {
                    const entityId = pair.bt.id; // use BT id to represent the entityId
                    const existingDiscrepancy = await this.discrepancyRepositoryService.findOneByEntityTypeAndEntityId(
                        command.tenantId,
                        command.entityType,
                        entityId,
                    );

                    await this.discrepancyRepositoryService.createOrUpdateById(command.tenantId, {
                        id: existingDiscrepancy?.id,
                        entityType: command.entityType,
                        entityId: entityId,
                        internalData: pair.db as unknown as Record<string, unknown>,
                        externalData: pair.bt as unknown as Record<string, unknown>,
                        lastModificationDate: DateUtility.getCurrentUtcDate(), // Force modification date to be updated
                    });
                }),
            ),
        );

        // Delete obsolete discrepancies
        await this.discrepancyRepositoryService.deleteByLastModificationDateBefore(
            command.tenantId,
            command.entityType,
            startSyncUtcDate,
        );

        const discrepancyOverview: DiscrepancyOverview = {
            entityType: command.entityType,
            totalBtData: btData.length,
            totalDbData: dbData.length,
            identicalIds: identicalData.map((d) => d.id),
            onlyInExternalIds: onlyInBt.map((d) => d.id),
            onlyInInternalIds: onlyInDb.map((d) => d.id),
            mismatchedIds: differentDataPairs.map((pair) => pair.bt.id),
        };

        this.eventBus.publish(
            new DiscrepancyScannedEvent(command.transactionId, {
                tenantId: command.tenantId,
                discrepancyOverview: discrepancyOverview,
            }),
        );

        return discrepancyOverview;
    }
}
