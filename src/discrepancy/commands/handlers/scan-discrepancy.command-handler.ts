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

            // Mark identical data as synced
            await Promise.all(
                identicalData.map((data, index) =>
                    this.dbConnLimit(async () => {
                        await RetryUtility.delay(this.discrepancyScannerService.delayBetweenCallsMs * index);
                        return RetryUtility.executeWithRetry(
                            () => discrepancyStrategy.dbMarkAsSyncedFunc(command.transactionId, command.tenantId, data),
                            `Mark entity ${data.id} as synced`,
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
                                await this.discrepancyRepositoryService.findOneByEntityTypeAndEntityId(
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
                                lastModificationDate: this.discrepancyScannerService.getSyncStartDate(), // Force modification date to be updated
                            });
                        }, `Save discrepancy for entity ${bt.id} (only in BT)`);
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
                                await this.discrepancyRepositoryService.findOneByEntityTypeAndEntityId(
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
                                lastModificationDate: this.discrepancyScannerService.getSyncStartDate(), // Force modification date to be updated
                            });
                        }, `Save discrepancy for entity ${db.id} (only in DB)`);
                    }),
                ),
            );

            // Handle data which have different content
            await Promise.all(
                differentDataPairs.map((pair, index) =>
                    this.dbConnLimit(async () => {
                        await RetryUtility.delay(this.discrepancyScannerService.delayBetweenCallsMs * index);
                        return RetryUtility.executeWithRetry(async () => {
                            const entityId = pair.bt.id; // use BT id to represent the entityId
                            const existingDiscrepancy =
                                await this.discrepancyRepositoryService.findOneByEntityTypeAndEntityId(
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
                                lastModificationDate: this.discrepancyScannerService.getSyncStartDate(), // Force modification date to be updated
                            });
                        }, `Save discrepancy for mismatched entity ${pair.bt.id}`);
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
            // Handle BeyondTrust API errors gracefully
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Error scanning ${command.entityType}:`, errorMessage);

            // Check if this is a known problematic entity or API connectivity issue
            const isApiError =
                errorMessage.includes('timeout') ||
                errorMessage.includes('ECONNRESET') ||
                errorMessage.includes('ENOTFOUND') ||
                errorMessage.includes('502') ||
                errorMessage.includes('503') ||
                errorMessage.includes('504');

            if (isApiError) {
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

            // Re-throw non-API errors
            throw error;
        }
    }
}
