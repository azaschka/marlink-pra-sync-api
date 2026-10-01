import { BadRequestException, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { ApiTenantIdHeader, TenantIdHeader, TransactionIdHeader } from '../../core/decorators';
import { ScanContext } from '../../shared/context/scan-context';
import { RetryUtility, UuidUtility } from '../../shared/utilities';
import { ScanDiscrepancyCommand } from '../commands';
import { RetrieveDiscrepanciesDtoInput } from '../dtos/inputs';
import { DiscrepancyDtoOutput, DiscrepancyOverviewDtoOutput } from '../dtos/outputs';
import { DiscrepancyEntityType, DiscrepancyScanState } from '../enums';
import { Discrepancy, DiscrepancyOverview } from '../models';
import { RetrieveDiscrepanciesQuery } from '../queries';
import { DiscrepancyScanOutcome } from '../services/discrepancy-scan-outcome';

@ApiTenantIdHeader()
@ApiTags('Discrepancies')
@Controller('discrepancies')
export class DiscrepancyScannerController {
    private static readonly DELAY_BETWEEN_ENTITY_SCANS_MS = 1000;
    private static readonly UNAVAILABLE_AFTER_CONSECUTIVE_FAILURES = 3;

    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly appConfigService: AppConfigService,
    ) {}

    @Get()
    @ApiOkResponse({ type: DiscrepancyDtoOutput, isArray: true })
    public async retrieveDiscrepancies(
        @TransactionIdHeader() transactionId: string = UuidUtility.generate(),
        @TenantIdHeader() tenantId: number,
        @Query() dtoInput: RetrieveDiscrepanciesDtoInput,
    ): Promise<DiscrepancyDtoOutput[]> {
        const result = await this.queryBus.execute<RetrieveDiscrepanciesQuery, Discrepancy[]>(
            new RetrieveDiscrepanciesQuery(
                transactionId,
                tenantId,
                dtoInput.pageSize,
                dtoInput.pageNumber,
                dtoInput.entityType,
                dtoInput.entityId,
            ),
        );

        return result;
    }

    @Post('/scan/all')
    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    public async scanAllDiscrepancies(
        @TransactionIdHeader() transactionId: string = UuidUtility.generate(),
        @TenantIdHeader() tenantId: number,
    ): Promise<DiscrepancyOverview[]> {
        const entityTypeOrder = [
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

        return this.withScanBudget(tenantId, async () => {
            const logPrefix = DiscrepancyScanOutcome.logPrefix(tenantId);
            const startedAt = Date.now();
            const scanResults: DiscrepancyOverview[] = [];
            let consecutiveUnavailable = 0;

            console.log(`🔎 ${logPrefix} started (heapUsed ${DiscrepancyScannerController.heapUsedMb()} MB)`);

            for (const [index, entityType] of entityTypeOrder.entries()) {
                const remaining = entityTypeOrder.slice(index);

                if (ScanContext.isAborted()) {
                    console.warn(`⏹️ ${logPrefix} budget expired; not scanned: ${remaining.join(', ')}`);
                    scanResults.push(
                        ...remaining.map((type) =>
                            DiscrepancyScanOutcome.incomplete(type, DiscrepancyScanState.Aborted, 'Cancelled'),
                        ),
                    );
                    break;
                }

                // Circuit breaker: the instance is treated as unavailable for the rest of this cycle. The next
                // cycle tries again. A broken instance costs seconds instead of the full retry budget per type.
                if (consecutiveUnavailable >= DiscrepancyScannerController.UNAVAILABLE_AFTER_CONSECUTIVE_FAILURES) {
                    console.warn(
                        `⏭️ ${logPrefix} BeyondTrust instance unavailable after ${consecutiveUnavailable} failed types; skipped: ${remaining.join(', ')}`,
                    );
                    scanResults.push(
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
                    overview = await this.scanDiscrepancies(transactionId, tenantId, entityType);
                } catch (error) {
                    overview = DiscrepancyScanOutcome.fromError(entityType, error);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.error(
                        `❌ ${logPrefix} ${entityType} ${overview.state}(${overview.failureKind}):`,
                        errorMessage,
                    );
                }

                scanResults.push(overview);
                consecutiveUnavailable = DiscrepancyScanOutcome.indicatesUnavailableInstance(overview)
                    ? consecutiveUnavailable + 1
                    : 0;

                // Add delay between entity scans to prevent overwhelming the system
                await RetryUtility.delay(DiscrepancyScannerController.DELAY_BETWEEN_ENTITY_SCANS_MS).catch(
                    () => undefined,
                );
            }

            const summary = DiscrepancyScanOutcome.summarize(scanResults);
            console.log(
                `${summary.allSucceeded ? '🎉' : '⚠️'} ${logPrefix} finished: ${summary.text} in ${Math.round(
                    (Date.now() - startedAt) / 1000,
                )}s (heapUsed ${DiscrepancyScannerController.heapUsedMb()} MB)`,
            );

            return scanResults;
        });
    }

    @Post('/scan/:entityType')
    @ApiParam({
        name: 'entityType',
        enum: DiscrepancyEntityType,
        required: true,
        description: 'The type of entity to scan for discrepancies.',
    })
    @ApiOkResponse({ type: DiscrepancyOverviewDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async scanDiscrepancies(
        @TransactionIdHeader() transactionId: string = UuidUtility.generate(),
        @TenantIdHeader() tenantId: number,
        @Param('entityType') entityType: DiscrepancyEntityType,
    ): Promise<DiscrepancyOverviewDtoOutput> {
        if (!Object.values(DiscrepancyEntityType).includes(entityType)) {
            console.error(`Invalid entity type provided: ${entityType}`);
            throw new BadRequestException(`Invalid entity type: ${entityType}`);
        }

        // The handler reports BeyondTrust and database failures as an overview with state failed or aborted;
        // the ID lists of such an overview are empty and mean "unknown", not "nothing found".
        return this.withScanBudget(tenantId, () =>
            this.commandBus.execute<ScanDiscrepancyCommand, DiscrepancyOverview>(
                new ScanDiscrepancyCommand(transactionId, tenantId, entityType),
            ),
        );
    }

    /**
     * Runs a scan within the cycle budget (DISCREPANCY_SCAN_CYCLE_BUDGET_IN_MS). A per-type scan called from
     * scanAllDiscrepancies joins the budget of the surrounding cycle.
     */
    private withScanBudget<T>(tenantId: number, operation: () => Promise<T>): Promise<T> {
        return ScanContext.runWithBudget(
            {
                // Short ID for log correlation; not used as a key.
                scanId: UuidUtility.generate().slice(0, 8),
                tenantId,
                budgetInMs: this.appConfigService.discrepancy.scan.cycleBudgetInMs,
            },
            operation,
        );
    }

    private static heapUsedMb(): number {
        return Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    }
}
