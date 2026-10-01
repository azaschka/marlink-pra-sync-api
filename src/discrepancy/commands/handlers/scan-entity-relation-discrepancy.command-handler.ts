/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import pLimit, { LimitFunction } from 'p-limit';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { BtApiErrorKind } from '../../../beyondtrust-pra-conf-api/http-client/errors/bt-api-error';
import { ScanContext } from '../../../shared/context/scan-context';
import { RetryUtility } from '../../../shared/utilities';
import { DiscrepancyScannedEvent } from '../../events';
import { DiscrepancyScanState } from '../../enums';
import { DiscrepancyOverview } from '../../models';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { DiscrepancyScanOutcome } from '../../services/discrepancy-scan-outcome';
import { DiscrepancyScannerService } from '../../services/discrepancy-scanner.service';
import { DiscrepancyStrategyProviderService } from '../../services/discrepancy-strategy-provider.service';
import { DiscrepancyStrategy } from '../../types';
import { ScanEntityRelationDiscrepancyCommand } from '../scan-entity-relation-discrepancy.command';

@CommandHandler(ScanEntityRelationDiscrepancyCommand)
export class ScanEntityRelationDiscrepancyCommandHandler implements ICommandHandler<ScanEntityRelationDiscrepancyCommand> {
    private readonly dbConnLimit: LimitFunction;

    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly discrepancyStrategyProviderService: DiscrepancyStrategyProviderService,
        private readonly discrepancyRepositoryService: DiscrepancyRepositoryService,
        private readonly discrepancyScannerService: DiscrepancyScannerService,
        private readonly eventBus: EventBus,
    ) {
        const maxConnections = this.appConfigService.databaseMaxConnections;
        // Sagas dispatch up to 7 concurrent instances of this handler simultaneously
        // (GroupPolicySaga: 4 types, UserSaga: 1, JumpointSaga: 1, TeamSaga: 1).
        // Using /2 like ScanDiscrepancyCommandHandler would allow 7 * (maxConnections/2)
        // concurrent DB connections, which exhausts the pool and fills the queue.
        // Dividing by 8 ensures all concurrent instances together stay within the pool:
        //   pool=50 → pLimit(6): 7 handlers * 6 = 42 connections (pool: 50) ✅
        const concurrencyLimit = Math.max(2, Math.floor(maxConnections / 8));
        this.dbConnLimit = pLimit(concurrencyLimit);
    }

    /**
     * Scans the relations of every parent. A parent whose fetch fails (including 404) is skipped: its existing
     * discrepancies stay untouched and no event (auto-sync) is published for it. Cleanup is scoped to the
     * parent; the type-wide cleanup of parents that no longer exist only runs when every parent succeeded.
     */
    public async execute(command: ScanEntityRelationDiscrepancyCommand): Promise<DiscrepancyScanState> {
        // Whole seconds and constant for every record of this run (see getSyncStartDate).
        const startSyncUtcDate = this.discrepancyScannerService.getSyncStartDate();
        const logPrefix = `${DiscrepancyScanOutcome.logPrefix(command.tenantId)} relation ${command.entityType}`;
        const parentIds = [
            ...command.identicalDataIds,
            ...command.onlyInExternalIds,
            ...command.onlyInInternalIds,
            ...command.differentDataIds,
        ];
        const failureKinds = new Map<string, number>();
        let succeeded = 0;
        let aborted = false;

        for (const parentId of parentIds) {
            if (ScanContext.isAborted()) {
                aborted = true;
                break;
            }

            try {
                const discrepancyStrategy = this.discrepancyStrategyProviderService.getForRelation(
                    parentId,
                    command.entityType,
                ) as DiscrepancyStrategy<unknown, unknown, unknown>;

                // Fetch BeyondTrust data with error handling for 404 (parent might not exist)
                const { transformed: btData } =
                    await this.discrepancyScannerService.fetchFromBeyondTrustWithErrorHandling(
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

                // Pre-fetch all existing discrepancy records scoped to this parent in a single query.
                // Builds a foreignEntityId → id Map to replace N individual findOne calls below.
                const existingDiscrepancies = await this.discrepancyRepositoryService.findManyByEntityTypeAndEntityId(
                    command.tenantId,
                    command.entityType,
                    parentId,
                );
                const existingIdByForeignEntityId = new Map<number, number>(
                    existingDiscrepancies
                        .filter((d) => d.foreignEntityId !== undefined && d.foreignEntityId !== null)
                        .map((d) => [d.foreignEntityId!, d.id]),
                );

                const parentProp = discrepancyStrategy.relationalEntityComparisonProps!.parent;
                const childProp = discrepancyStrategy.relationalEntityComparisonProps!.child;

                // Mark identical data as synced
                await Promise.all(
                    identicalData.map((data) =>
                        this.dbConnLimit(() =>
                            RetryUtility.executeDatabaseOperation(
                                () =>
                                    discrepancyStrategy.dbMarkAsSyncedFunc(
                                        command.transactionId,
                                        command.tenantId,
                                        data,
                                    ),
                                `Mark entity (parent: ${parentId}) as synced`,
                            ),
                        ),
                    ),
                );

                // Handle data which only exist in BT
                await Promise.all(
                    onlyInBt.map((bt) => {
                        const entityId = bt[parentProp] as number;
                        const foreignEntityId = bt[childProp] as number;
                        return this.dbConnLimit(() =>
                            RetryUtility.executeDatabaseOperation(
                                () =>
                                    this.discrepancyRepositoryService.createOrUpdateById(command.tenantId, {
                                        id: existingIdByForeignEntityId.get(foreignEntityId),
                                        entityType: command.entityType,
                                        entityId: entityId,
                                        foreignEntityId: foreignEntityId,
                                        internalData: undefined,
                                        externalData: bt as unknown as Record<string, unknown>,
                                        lastModificationDate: startSyncUtcDate,
                                    }),
                                `Save discrepancy for entity (parent: ${parentId}, child: ${foreignEntityId}) (only in BT)`,
                            ),
                        );
                    }),
                );

                // Handle data which only exist in DB
                await Promise.all(
                    onlyInDb.map((db) => {
                        const entityId = db[parentProp] as number;
                        const foreignEntityId = db[childProp] as number;
                        return this.dbConnLimit(() =>
                            RetryUtility.executeDatabaseOperation(
                                () =>
                                    this.discrepancyRepositoryService.createOrUpdateById(command.tenantId, {
                                        id: existingIdByForeignEntityId.get(foreignEntityId),
                                        entityType: command.entityType,
                                        entityId: entityId,
                                        foreignEntityId: foreignEntityId,
                                        internalData: db as unknown as Record<string, unknown>,
                                        externalData: undefined,
                                        lastModificationDate: startSyncUtcDate,
                                    }),
                                `Save discrepancy for entity (parent: ${parentId}, child: ${foreignEntityId}) (only in DB)`,
                            ),
                        );
                    }),
                );

                // Handle data which have different content
                await Promise.all(
                    differentDataPairs.map((pair) => {
                        const entityId = pair.bt[parentProp] as number;
                        const foreignEntityId = pair.bt[childProp] as number;
                        return this.dbConnLimit(() =>
                            RetryUtility.executeDatabaseOperation(
                                () =>
                                    this.discrepancyRepositoryService.createOrUpdateById(command.tenantId, {
                                        id: existingIdByForeignEntityId.get(foreignEntityId),
                                        entityType: command.entityType,
                                        entityId: entityId,
                                        foreignEntityId: foreignEntityId,
                                        internalData: pair.db as unknown as Record<string, unknown>,
                                        externalData: pair.bt as unknown as Record<string, unknown>,
                                        lastModificationDate: startSyncUtcDate,
                                    }),
                                `Save discrepancy for mismatched entity (parent: ${parentId}, child: ${foreignEntityId})`,
                            ),
                        );
                    }),
                );

                // No cleanup when the budget expired during this parent
                ScanContext.throwIfAborted();

                // Delete obsolete discrepancies of this parent only (one retry for transient database errors only)
                await RetryUtility.executeDatabaseOperation(
                    () =>
                        this.discrepancyRepositoryService.deleteByEntityIdAndLastModificationDateBefore(
                            command.tenantId,
                            command.entityType,
                            parentId,
                            startSyncUtcDate,
                        ),
                    `Delete obsolete discrepancies for ${command.entityType} (parent: ${parentId})`,
                );

                const discrepancyOverview: DiscrepancyOverview = {
                    entityType: command.entityType,
                    totalBtData: btData.length,
                    totalDbData: dbData.length,
                    parentId: parentId,
                    identicalIds: identicalData.map((d) => d[childProp] as number),
                    onlyInExternalIds: onlyInBt.map((d) => d[childProp] as number),
                    onlyInInternalIds: onlyInDb.map((d) => d[childProp] as number),
                    mismatchedIds: differentDataPairs.map((pair) => pair.bt[childProp] as number),
                    state: DiscrepancyScanState.Succeeded,
                };

                this.eventBus.publish(
                    new DiscrepancyScannedEvent(command.transactionId, {
                        tenantId: command.tenantId,
                        discrepancyOverview: discrepancyOverview,
                    }),
                );
                succeeded++;
            } catch (error) {
                if (DiscrepancyScanOutcome.isAbort(error)) {
                    aborted = true;
                    break;
                }

                // Skip this parent and continue with the next one.
                const kind = DiscrepancyScanOutcome.failureKindOf(error);
                failureKinds.set(kind, (failureKinds.get(kind) ?? 0) + 1);

                if (kind !== String(BtApiErrorKind.NotFound)) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.warn(`⚠️ ${logPrefix} parent ${parentId} skipped (${kind}): ${errorMessage}`);
                }
            }
        }

        const failed = [...failureKinds.values()].reduce((sum, n) => sum + n, 0);

        // Discrepancies of parents that no longer exist anywhere are only removed after a complete run.
        if (!aborted && failed === 0 && parentIds.length > 0) {
            await RetryUtility.executeDatabaseOperation(
                () =>
                    this.discrepancyRepositoryService.deleteByLastModificationDateBefore(
                        command.tenantId,
                        command.entityType,
                        startSyncUtcDate,
                    ),
                `Delete obsolete discrepancies for ${command.entityType} (all parents)`,
            );
        }

        const state = aborted
            ? DiscrepancyScanState.Aborted
            : failed === 0
              ? DiscrepancyScanState.Succeeded
              : succeeded > 0
                ? DiscrepancyScanState.Partial
                : DiscrepancyScanState.Failed;

        if (parentIds.length > 0) {
            const kinds = [...failureKinds.entries()].map(([kind, n]) => `${kind} x${n}`).join(', ');
            console.log(
                `${state === DiscrepancyScanState.Succeeded ? '✅' : '⚠️'} ${logPrefix} ${state}: ${succeeded}/${parentIds.length} parents succeeded${
                    failed > 0 ? `, ${failed} skipped (${kinds})` : ''
                }${aborted ? `, stopped after ${succeeded + failed} parents because the budget expired` : ''}`,
            );
        }

        return state;
    }
}
