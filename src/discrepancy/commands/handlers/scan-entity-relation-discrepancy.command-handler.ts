import { HttpException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { differenceWith, intersectionWith, isEqual } from 'lodash';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { GroupPolicyJumpGroupRetrievedDtoOutput as BTGroupPolicyJumpGroup } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { GroupPolicyJumpGroup as DBGroupPolicyJumpGroup } from '../../../group-policy-jump-group/models';
import { GroupPolicyJumpGroupEntity } from '../../../group-policy-jump-group/repositories/entities';
import { DateUtility, ObjectUtility, PaginationUtility } from '../../../shared/utilities';
import { DiscrepancyFoundEvent } from '../../events';
import { DiscrepancyOverview } from '../../models';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { DiscrepancyStrategyProviderService } from '../../services/discrepancy-strategy-provider.service';
import { DiscrepancyStrategy } from '../../types';
import { ScanEntityRelationDiscrepancyCommand } from '../scan-entity-relation-discrepancy.command';

// Using GroupPolicyJumpGroup as representative type.
// TODO: Generalize for different discrepancy types.
type RepresentativeEntity = GroupPolicyJumpGroupEntity;
type BTRepresentative = BTGroupPolicyJumpGroup;
type DBRepresentative = DBGroupPolicyJumpGroup;

@CommandHandler(ScanEntityRelationDiscrepancyCommand)
export class ScanEntityRelationDiscrepancyCommandHandler
    implements ICommandHandler<ScanEntityRelationDiscrepancyCommand>
{
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly discrepancyStrategyProviderService: DiscrepancyStrategyProviderService,
        private readonly discrepancyRepositoryService: DiscrepancyRepositoryService,
        private readonly eventBus: EventBus,
    ) {}

    public async execute(command: ScanEntityRelationDiscrepancyCommand): Promise<void> {
        const startSyncUtcDate = DateUtility.getCurrentUtcDate();

        for (const parentId of [
            ...command.identicalDataIds,
            ...command.onlyInExternalIds,
            ...command.onlyInInternalIds,
            ...command.differentDataIds,
        ]) {
            const discrepancyStrategy = this.discrepancyStrategyProviderService.getForRelation(
                parentId,
                command.entityType,
            ) as unknown as DiscrepancyStrategy<BTRepresentative, DBRepresentative, RepresentativeEntity>;

            const btData = (
                await PaginationUtility.queryUntilDuplicatePage(
                    (pageNumber: number) =>
                        discrepancyStrategy
                            .btRetrieveFunc(
                                command.transactionId,
                                command.tenantId,
                                this.appConfigService.sync.maxBatchSize,
                                pageNumber,
                            )
                            .catch((error) => {
                                if (error instanceof HttpException && error.getStatus() === 404) {
                                    return [];
                                }

                                throw error;
                            }),
                    discrepancyStrategy.btOmittedPropsForDuplicateCheck,
                )
            )
                .map((btData) => discrepancyStrategy.btToDbEntity(btData))
                .map((data) => ObjectUtility.stripProperties(data, ...discrepancyStrategy.trimmedProps))
                .map((data) => JSON.parse(JSON.stringify(data)) as RepresentativeEntity); // Remove undefined values and convert to plain object

            const dbData = (
                await PaginationUtility.queryUntilLastPage((pageNumber: number) =>
                    discrepancyStrategy
                        .dbRetrieveFunc(
                            command.transactionId,
                            command.tenantId,
                            this.appConfigService.sync.maxBatchSize,
                            pageNumber,
                        )
                        .catch((error) => {
                            if (error instanceof NotFoundException) {
                                return [];
                            }

                            throw error;
                        }),
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
            const onlyInBt = differenceWith(
                remainingBtData,
                remainingDbData,
                (bt, db) =>
                    bt[discrepancyStrategy.relationalEntityComparisonProps!.parent] ===
                        db[discrepancyStrategy.relationalEntityComparisonProps!.parent] &&
                    bt[discrepancyStrategy.relationalEntityComparisonProps!.child] ===
                        db[discrepancyStrategy.relationalEntityComparisonProps!.child],
            );

            const onlyInDb = differenceWith(
                remainingDbData,
                remainingBtData,
                (bt, db) =>
                    bt[discrepancyStrategy.relationalEntityComparisonProps!.parent] ===
                        db[discrepancyStrategy.relationalEntityComparisonProps!.parent] &&
                    bt[discrepancyStrategy.relationalEntityComparisonProps!.child] ===
                        db[discrepancyStrategy.relationalEntityComparisonProps!.child],
            );

            // 4. different content
            const differentDataPairs = intersectionWith(
                remainingBtData,
                remainingDbData,
                (bt, db) =>
                    bt[discrepancyStrategy.relationalEntityComparisonProps!.parent] ===
                        db[discrepancyStrategy.relationalEntityComparisonProps!.parent] &&
                    bt[discrepancyStrategy.relationalEntityComparisonProps!.child] ===
                        db[discrepancyStrategy.relationalEntityComparisonProps!.child],
            )
                .map((bt) => {
                    const db = remainingDbData.find(
                        (db) =>
                            db[discrepancyStrategy.relationalEntityComparisonProps!.parent] ===
                                bt[discrepancyStrategy.relationalEntityComparisonProps!.parent] &&
                            db[discrepancyStrategy.relationalEntityComparisonProps!.child] ===
                                bt[discrepancyStrategy.relationalEntityComparisonProps!.child],
                    );
                    return db && !isEqual(bt, db) ? { bt, db } : null;
                })
                .filter((pair) => pair !== null);

            // Mark identical data as synced
            for (const data of identicalData) {
                await discrepancyStrategy.dbMarkAsSyncedFunc(
                    command.transactionId,
                    command.tenantId,
                    data[discrepancyStrategy.relationalEntityComparisonProps!.child] as number,
                );
            }

            // Handle data which only exist in BT
            for (const bt of onlyInBt) {
                const existingDiscrepancy =
                    await this.discrepancyRepositoryService.findOneByEntityTypeEntityIdAndForeignEntityId(
                        command.tenantId,
                        command.entityType,
                        bt[discrepancyStrategy.relationalEntityComparisonProps!.parent] as number,
                        bt[discrepancyStrategy.relationalEntityComparisonProps!.child] as number,
                    );

                await this.discrepancyRepositoryService.createOrUpdateById(command.tenantId, {
                    id: existingDiscrepancy?.id,
                    entityType: command.entityType,
                    entityId: bt[discrepancyStrategy.relationalEntityComparisonProps!.parent] as number,
                    foreignEntityId: bt[discrepancyStrategy.relationalEntityComparisonProps!.child] as number,
                    internalData: undefined,
                    externalData: bt as unknown as Record<string, unknown>,
                    lastModificationDate: DateUtility.getCurrentUtcDate(), // Force modification date to be updated
                });
            }

            // Handle data which only exist in DB
            for (const db of onlyInDb) {
                const existingDiscrepancy =
                    await this.discrepancyRepositoryService.findOneByEntityTypeEntityIdAndForeignEntityId(
                        command.tenantId,
                        command.entityType,
                        db[discrepancyStrategy.relationalEntityComparisonProps!.parent] as number,
                        db[discrepancyStrategy.relationalEntityComparisonProps!.child] as number,
                    );

                await this.discrepancyRepositoryService.createOrUpdateById(command.tenantId, {
                    id: existingDiscrepancy?.id,
                    entityType: command.entityType,
                    entityId: db[discrepancyStrategy.relationalEntityComparisonProps!.parent] as number,
                    foreignEntityId: db[discrepancyStrategy.relationalEntityComparisonProps!.child] as number,
                    internalData: db as unknown as Record<string, unknown>,
                    externalData: undefined,
                    lastModificationDate: DateUtility.getCurrentUtcDate(), // Force modification date to be updated
                });
            }

            // Handle data which have different content
            for (const pair of differentDataPairs) {
                const entityId = pair.bt[discrepancyStrategy.relationalEntityComparisonProps!.parent] as number;
                const foreignEntityId = pair.bt[discrepancyStrategy.relationalEntityComparisonProps!.child] as number;

                const existingDiscrepancy =
                    await this.discrepancyRepositoryService.findOneByEntityTypeEntityIdAndForeignEntityId(
                        command.tenantId,
                        command.entityType,
                        entityId,
                        foreignEntityId,
                    );

                await this.discrepancyRepositoryService.createOrUpdateById(command.tenantId, {
                    id: existingDiscrepancy?.id,
                    entityType: command.entityType,
                    entityId: entityId,
                    foreignEntityId: foreignEntityId,
                    internalData: pair.db as unknown as Record<string, unknown>,
                    externalData: pair.bt as unknown as Record<string, unknown>,
                    lastModificationDate: DateUtility.getCurrentUtcDate(), // Force modification date to be updated
                });
            }

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
                parentId: parentId,
                identicalIds: identicalData.map(
                    (d) => d[discrepancyStrategy.relationalEntityComparisonProps!.child] as number,
                ),
                onlyInExternalIds: onlyInBt.map(
                    (d) => d[discrepancyStrategy.relationalEntityComparisonProps!.child] as number,
                ),
                onlyInInternalIds: onlyInDb.map(
                    (d) => d[discrepancyStrategy.relationalEntityComparisonProps!.child] as number,
                ),
                mismatchedIds: differentDataPairs.map(
                    (pair) => pair.bt[discrepancyStrategy.relationalEntityComparisonProps!.child] as number,
                ),
            };

            if (
                discrepancyOverview.onlyInExternalIds.length > 0 ||
                discrepancyOverview.onlyInInternalIds.length > 0 ||
                discrepancyOverview.mismatchedIds.length > 0
            ) {
                this.eventBus.publish(
                    new DiscrepancyFoundEvent(command.transactionId, {
                        tenantId: command.tenantId,
                        discrepancyOverview: discrepancyOverview,
                    }),
                );
            }
        }
    }
}
