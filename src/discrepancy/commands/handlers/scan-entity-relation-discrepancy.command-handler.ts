/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import pLimit, { LimitFunction } from 'p-limit';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { RetryUtility } from '../../../shared/utilities';
import { DiscrepancyScannedEvent } from '../../events';
import { DiscrepancyOverview } from '../../models';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { DiscrepancyScannerService } from '../../services/discrepancy-scanner.service';
import { DiscrepancyStrategyProviderService } from '../../services/discrepancy-strategy-provider.service';
import { DiscrepancyStrategy } from '../../types';
import { ScanEntityRelationDiscrepancyCommand } from '../scan-entity-relation-discrepancy.command';

@CommandHandler(ScanEntityRelationDiscrepancyCommand)
export class ScanEntityRelationDiscrepancyCommandHandler
    implements ICommandHandler<ScanEntityRelationDiscrepancyCommand>
{
    private readonly dbConnLimit: LimitFunction;

    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly discrepancyStrategyProviderService: DiscrepancyStrategyProviderService,
        private readonly discrepancyRepositoryService: DiscrepancyRepositoryService,
        private readonly discrepancyScannerService: DiscrepancyScannerService,
        private readonly eventBus: EventBus,
    ) {
        const maxConnections = this.appConfigService.databaseMaxConnections;
        const concurrencyLimit = Math.floor(maxConnections / 2);
        this.dbConnLimit = pLimit(concurrencyLimit);
    }

    public async execute(command: ScanEntityRelationDiscrepancyCommand): Promise<void> {
        const startSyncUtcDate = this.discrepancyScannerService.getSyncStartDate();

        for (const parentId of [
            ...command.identicalDataIds,
            ...command.onlyInExternalIds,
            ...command.onlyInInternalIds,
            ...command.differentDataIds,
        ]) {
            const discrepancyStrategy = this.discrepancyStrategyProviderService.getForRelation(
                parentId,
                command.entityType,
            ) as DiscrepancyStrategy<unknown, unknown, unknown>;

            // Fetch BeyondTrust data with error handling for 404 (parent might not exist)
            const { transformed: btData } = await this.discrepancyScannerService.fetchFromBeyondTrustWithErrorHandling(
                discrepancyStrategy,
                command.transactionId,
                command.tenantId,
            );

            // Fetch DB data with error handling for NotFoundException (parent might not exist)
            const dbData = await this.discrepancyScannerService.fetchFromDatabaseWithErrorHandling(
                discrepancyStrategy,
                command.transactionId,
                command.tenantId,
            );

            // Analyze discrepancies using relational comparison
            const {
                identical: identicalData,
                onlyInBt,
                onlyInDb,
                differentPairs: differentDataPairs,
            } = this.discrepancyScannerService.analyzeRelationalDiscrepancies(
                btData,
                dbData,
                discrepancyStrategy.relationalEntityComparisonProps!,
            );

            // Mark identical data as synced
            await Promise.all(
                identicalData.map((data, index) =>
                    this.dbConnLimit(async () => {
                        await RetryUtility.delay(this.discrepancyScannerService.delayBetweenCallsMs * index);
                        return RetryUtility.executeWithRetry(
                            () => discrepancyStrategy.dbMarkAsSyncedFunc(command.transactionId, command.tenantId, data),
                            `Mark entity (parent: ${parentId}) as synced`,
                        );
                    }),
                ),
            );

            // Handle data which only exist in BT
            await Promise.all(
                onlyInBt.map((bt, index) =>
                    this.dbConnLimit(async () => {
                        await RetryUtility.delay(this.discrepancyScannerService.delayBetweenCallsMs * index);
                        return RetryUtility.executeWithRetry(async () => {
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
                                foreignEntityId: bt[
                                    discrepancyStrategy.relationalEntityComparisonProps!.child
                                ] as number,
                                internalData: undefined,
                                externalData: bt as unknown as Record<string, unknown>,
                                lastModificationDate: this.discrepancyScannerService.getSyncStartDate(), // Force modification date to be updated
                            });
                        }, `Save discrepancy for entity (parent: ${parentId}, child: ${bt[discrepancyStrategy.relationalEntityComparisonProps!.child]}) (only in BT)`);
                    }),
                ),
            );

            // Handle data which only exist in DB
            await Promise.all(
                onlyInDb.map((db, index) =>
                    this.dbConnLimit(async () => {
                        await RetryUtility.delay(this.discrepancyScannerService.delayBetweenCallsMs * index);
                        return RetryUtility.executeWithRetry(async () => {
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
                                foreignEntityId: db[
                                    discrepancyStrategy.relationalEntityComparisonProps!.child
                                ] as number,
                                internalData: db as unknown as Record<string, unknown>,
                                externalData: undefined,
                                lastModificationDate: this.discrepancyScannerService.getSyncStartDate(), // Force modification date to be updated
                            });
                        }, `Save discrepancy for entity (parent: ${parentId}, child: ${db[discrepancyStrategy.relationalEntityComparisonProps!.child]}) (only in DB)`);
                    }),
                ),
            );

            // Handle data which have different content
            await Promise.all(
                differentDataPairs.map((pair, index) =>
                    this.dbConnLimit(async () => {
                        await RetryUtility.delay(this.discrepancyScannerService.delayBetweenCallsMs * index);
                        return RetryUtility.executeWithRetry(async () => {
                            const entityId = pair.bt[
                                discrepancyStrategy.relationalEntityComparisonProps!.parent
                            ] as number;
                            const foreignEntityId = pair.bt[
                                discrepancyStrategy.relationalEntityComparisonProps!.child
                            ] as number;

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
                                lastModificationDate: this.discrepancyScannerService.getSyncStartDate(), // Force modification date to be updated
                            });
                        }, `Save discrepancy for mismatched entity (parent: ${parentId}, child: ${pair.bt[discrepancyStrategy.relationalEntityComparisonProps!.child]})`);
                    }),
                ),
            );

            // Delete obsolete discrepancies with retry
            await RetryUtility.delay(this.discrepancyScannerService.delayBetweenCallsMs);
            await RetryUtility.executeWithRetry(
                () =>
                    this.discrepancyRepositoryService.deleteByLastModificationDateBefore(
                        command.tenantId,
                        command.entityType,
                        startSyncUtcDate,
                    ),
                `Delete obsolete discrepancies for ${command.entityType} (parent: ${parentId})`,
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

            this.eventBus.publish(
                new DiscrepancyScannedEvent(command.transactionId, {
                    tenantId: command.tenantId,
                    discrepancyOverview: discrepancyOverview,
                }),
            );
        }
    }
}
