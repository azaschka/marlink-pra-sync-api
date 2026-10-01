import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { ScanContext } from '../../shared/context/scan-context';
import { RetryUtility, UuidUtility } from '../../shared/utilities';
import { ScanDiscrepancyCommand } from '../commands';
import { DiscrepancyEntityType, DiscrepancyScanState } from '../enums';
import { DiscrepancyOverview } from '../models';
import { DiscrepancyScanOutcome } from './discrepancy-scan-outcome';
import { DiscrepancyScanStatusService } from './discrepancy-scan-status.service';
import { CycleOutcome, ScanCoordinatorService, ScanTrigger } from './scan-coordinator.service';

/**
 * Runs discrepancy scans through the ScanCoordinatorService: a cycle scans all entity types of one tenant in a
 * fixed order within the cycle budget, with a circuit breaker for an unavailable BeyondTrust instance.
 */
@Injectable()
export class DiscrepancyScanCycleService {
    public static readonly ENTITY_TYPE_ORDER: readonly DiscrepancyEntityType[] = [
        DiscrepancyEntityType.User,
        DiscrepancyEntityType.GroupPolicy,
        DiscrepancyEntityType.Team,
        DiscrepancyEntityType.Jumpoint,
        DiscrepancyEntityType.JumpPolicy,
        DiscrepancyEntityType.SessionPolicy,
        DiscrepancyEntityType.JumpGroup,
        DiscrepancyEntityType.JumpItemProtocolTunnelJump,
        DiscrepancyEntityType.JumpItemRemoteRdp,
        DiscrepancyEntityType.JumpItemRemoteVnc,
        DiscrepancyEntityType.JumpItemShellJump,
        DiscrepancyEntityType.JumpItemWebJump,
        DiscrepancyEntityType.JumpClient,
        DiscrepancyEntityType.JumpClientInstaller,
    ];

    private static readonly DELAY_BETWEEN_ENTITY_SCANS_MS = 1000;
    private static readonly UNAVAILABLE_AFTER_CONSECUTIVE_FAILURES = 3;

    constructor(
        private readonly commandBus: CommandBus,
        private readonly appConfigService: AppConfigService,
        private readonly scanCoordinatorService: ScanCoordinatorService,
        private readonly discrepancyScanStatusService: DiscrepancyScanStatusService,
    ) {}

    /**
     * One cycle for the tenant: all entity types, then the background work they triggered, within the cycle
     * budget. Skipped when the tenant is busy (cycle, exclusive operation or pending background work).
     */
    public async runCycle(transactionId: string, tenantId: number, trigger: ScanTrigger): Promise<CycleOutcome> {
        const startedAt = Date.now();
        const outcome = await this.scanCoordinatorService.runCycle(tenantId, trigger, () =>
            this.scanAllTypes(transactionId, tenantId),
        );

        this.discrepancyScanStatusService.record(tenantId, outcome);

        if (outcome.status === 'skipped') {
            console.warn(`⏭️ [scan] tenant ${tenantId} ${trigger} cycle skipped: ${outcome.reason}`);

            return outcome;
        }

        const summary = DiscrepancyScanOutcome.summarize(outcome.overviews);
        const success = summary.allSucceeded && !outcome.backgroundUnfinished;
        console.log(
            `${success ? '🎉' : '⚠️'} [scan ${outcome.scanId}] tenant ${tenantId} finished: ${summary.text} in ${Math.round(
                (Date.now() - startedAt) / 1000,
            )}s; background: ${this.scanCoordinatorService.backgroundSummary(outcome.background)}${
                outcome.backgroundUnfinished ? ' (unfinished, budget expired)' : ''
            } (heapUsed ${DiscrepancyScanCycleService.heapUsedMb()} MB)`,
        );

        return outcome;
    }

    /**
     * Scans one entity type. A request for a type whose scan is already in flight for the tenant joins it (no
     * second BeyondTrust fetch). Outside a cycle the scan gets its own budget.
     */
    public scanType(
        transactionId: string,
        tenantId: number,
        entityType: DiscrepancyEntityType,
    ): Promise<DiscrepancyOverview> {
        return this.scanCoordinatorService.scanType(tenantId, entityType, () =>
            ScanContext.runWithBudget(
                {
                    scanId: UuidUtility.generate().slice(0, 8),
                    tenantId,
                    budgetInMs: this.appConfigService.discrepancy.scan.cycleBudgetInMs,
                },
                () =>
                    this.commandBus.execute<ScanDiscrepancyCommand, DiscrepancyOverview>(
                        new ScanDiscrepancyCommand(transactionId, tenantId, entityType),
                    ),
            ),
        );
    }

    /** All entity types in order; runs inside the cycle's ScanContext. */
    private async scanAllTypes(transactionId: string, tenantId: number): Promise<DiscrepancyOverview[]> {
        const logPrefix = DiscrepancyScanOutcome.logPrefix(tenantId);
        const order = DiscrepancyScanCycleService.ENTITY_TYPE_ORDER;
        const overviews: DiscrepancyOverview[] = [];
        let consecutiveUnavailable = 0;

        console.log(`🔎 ${logPrefix} started (heapUsed ${DiscrepancyScanCycleService.heapUsedMb()} MB)`);

        for (const [index, entityType] of order.entries()) {
            const remaining = order.slice(index);

            if (ScanContext.isAborted()) {
                console.warn(`⏹️ ${logPrefix} budget expired; not scanned: ${remaining.join(', ')}`);
                overviews.push(
                    ...remaining.map((type) =>
                        DiscrepancyScanOutcome.incomplete(type, DiscrepancyScanState.Aborted, 'Cancelled'),
                    ),
                );
                break;
            }

            // Circuit breaker: the instance is treated as unavailable for the rest of this cycle. The next cycle
            // tries again. A broken instance costs seconds instead of the full retry budget per type.
            if (consecutiveUnavailable >= DiscrepancyScanCycleService.UNAVAILABLE_AFTER_CONSECUTIVE_FAILURES) {
                console.warn(
                    `⏭️ ${logPrefix} BeyondTrust instance unavailable after ${consecutiveUnavailable} failed types; skipped: ${remaining.join(', ')}`,
                );
                overviews.push(
                    ...remaining.map((type) =>
                        DiscrepancyScanOutcome.incomplete(
                            type,
                            DiscrepancyScanState.Skipped,
                            DiscrepancyScanOutcome.INSTANCE_UNAVAILABLE,
                        ),
                    ),
                );
                break;
            }

            let overview: DiscrepancyOverview;

            try {
                // No retry here: BeyondTrust calls are retried in HttpClientService only.
                overview = await this.scanType(transactionId, tenantId, entityType);
            } catch (error) {
                overview = DiscrepancyScanOutcome.fromError(entityType, error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(
                    `❌ ${logPrefix} ${entityType} ${overview.state}(${overview.failureKind}):`,
                    errorMessage,
                );
            }

            overviews.push(overview);
            consecutiveUnavailable = DiscrepancyScanOutcome.indicatesUnavailableInstance(overview)
                ? consecutiveUnavailable + 1
                : 0;

            // Add delay between entity scans to prevent overwhelming the system
            await RetryUtility.delay(DiscrepancyScanCycleService.DELAY_BETWEEN_ENTITY_SCANS_MS).catch(() => undefined);
        }

        return overviews;
    }

    private static heapUsedMb(): number {
        return Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    }
}
