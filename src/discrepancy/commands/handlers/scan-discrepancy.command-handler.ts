/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import pLimit, { LimitFunction } from 'p-limit';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { ErrorProcessorUtility, RetryUtility } from '../../../shared/utilities';
import { DiscrepancyScannedEvent } from '../../events';
import { DiscrepancyOverview } from '../../models';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { DiscrepancyScannerService } from '../../services/discrepancy-scanner.service';
import { DiscrepancyStrategyProviderService } from '../../services/discrepancy-strategy-provider.service';
import { DiscrepancyStrategy } from '../../types/discrepancy-strategy.type';
import { ScanDiscrepancyCommand } from '../scan-discrepancy.command';

@CommandHandler(ScanDiscrepancyCommand)
export class ScanDiscrepancyCommandHandler implements ICommandHandler<ScanDiscrepancyCommand> {
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

    public async execute(command: ScanDiscrepancyCommand): Promise<DiscrepancyOverview> {
        const startSyncUtcDate = this.discrepancyScannerService.getSyncStartDate();

        try {
            const discrepancyStrategy = this.discrepancyStrategyProviderService.get(
                command.entityType,
            ) as DiscrepancyStrategy<unknown, unknown, unknown>;

            // Fetch BeyondTrust data with retry mechanism per page (not entire pagination)
            const { transformed: btData } = await this.discrepancyScannerService.fetchFromBeyondTrust(
                discrepancyStrategy,
                command.transactionId,
                command.tenantId,
                command.entityType,
            );

            // Fetch DB data with retry mechanism
            const dbData = await this.discrepancyScannerService.fetchFromDatabase(
                discrepancyStrategy,
                command.transactionId,
                command.tenantId,
                command.entityType,
            );

            // Analyze discrepancies
            const {
                identical: identicalData,
                onlyInBt,
                onlyInDb,
                differentPairs: differentDataPairs,
            } = this.discrepancyScannerService.analyzeDiscrepancies(btData, dbData);

            // Pre-fetch all existing discrepancy records for this entity type in a single query.
            // Builds an entityId → id Map to replace N individual findOne calls in the loops below,
            // reducing DB round-trips from O(n) to O(1) per upsert. pLimit handles concurrency.
            const existingDiscrepancies = await this.discrepancyRepositoryService.findManyByEntityType(
                command.tenantId,
                command.entityType,
            );
            const existingIdByEntityId = new Map<number, number>(existingDiscrepancies.map((d) => [d.entityId, d.id]));

            // Mark identical data as synced
            await Promise.all(
                identicalData.map((data) =>
                    this.dbConnLimit(() =>
                        RetryUtility.executeWithRetry(
                            () => discrepancyStrategy.dbMarkAsSyncedFunc(command.transactionId, command.tenantId, data),
                            `Mark entity ${data.id} as synced`,
                        ),
                    ),
                ),
            );

            // Handle data which only exist in BT
            await Promise.all(
                onlyInBt.map((bt) =>
                    this.dbConnLimit(() =>
                        RetryUtility.executeWithRetry(
                            () =>
                                this.discrepancyRepositoryService.createOrUpdateById(command.tenantId, {
                                    id: existingIdByEntityId.get(bt.id),
                                    entityType: command.entityType,
                                    entityId: bt.id,
                                    internalData: undefined,
                                    externalData: bt as unknown as Record<string, unknown>,
                                    lastModificationDate: this.discrepancyScannerService.getSyncStartDate(),
                                }),
                            `Save discrepancy for entity ${bt.id} (only in BT)`,
                        ),
                    ),
                ),
            );

            // Handle data which only exist in DB
            await Promise.all(
                onlyInDb.map((db) =>
                    this.dbConnLimit(() =>
                        RetryUtility.executeWithRetry(
                            () =>
                                this.discrepancyRepositoryService.createOrUpdateById(command.tenantId, {
                                    id: existingIdByEntityId.get(db.id),
                                    entityType: command.entityType,
                                    entityId: db.id,
                                    internalData: db as unknown as Record<string, unknown>,
                                    externalData: undefined,
                                    lastModificationDate: this.discrepancyScannerService.getSyncStartDate(),
                                }),
                            `Save discrepancy for entity ${db.id} (only in DB)`,
                        ),
                    ),
                ),
            );

            // Handle data which have different content
            await Promise.all(
                differentDataPairs.map((pair) =>
                    this.dbConnLimit(() =>
                        RetryUtility.executeWithRetry(
                            () =>
                                this.discrepancyRepositoryService.createOrUpdateById(command.tenantId, {
                                    id: existingIdByEntityId.get(pair.bt.id),
                                    entityType: command.entityType,
                                    entityId: pair.bt.id,
                                    internalData: pair.db as unknown as Record<string, unknown>,
                                    externalData: pair.bt as unknown as Record<string, unknown>,
                                    lastModificationDate: this.discrepancyScannerService.getSyncStartDate(),
                                }),
                            `Save discrepancy for mismatched entity ${pair.bt.id}`,
                        ),
                    ),
                ),
            );

            // Delete obsolete discrepancies with retry
            await RetryUtility.executeWithRetry(
                () =>
                    this.discrepancyRepositoryService.deleteByLastModificationDateBefore(
                        command.tenantId,
                        command.entityType,
                        startSyncUtcDate,
                    ),
                `Delete obsolete discrepancies for ${command.entityType}`,
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

            console.log(
                `✅ Successfully completed discrepancy scan for ${command.entityType}: ${btData.length} BT records, ${dbData.length} DB records, ${identicalData.length} identical, ${onlyInBt.length} only in BT, ${onlyInDb.length} only in DB, ${differentDataPairs.length} mismatched`,
            );

            return discrepancyOverview;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Error scanning ${command.entityType}:`, errorMessage);

            if (ErrorProcessorUtility.isApiConnectivityError(error)) {
                console.warn(`⚠️ Skipping entity ${command.entityType} due to BeyondTrust API connectivity issues`);

                const emptyResult: DiscrepancyOverview = {
                    entityType: command.entityType,
                    totalBtData: 0,
                    totalDbData: 0,
                    identicalIds: [],
                    onlyInExternalIds: [],
                    onlyInInternalIds: [],
                    mismatchedIds: [],
                };

                this.eventBus.publish(
                    new DiscrepancyScannedEvent(command.transactionId, {
                        tenantId: command.tenantId,
                        discrepancyOverview: emptyResult,
                    }),
                );

                return emptyResult;
            }

            throw error;
        }
    }
}
