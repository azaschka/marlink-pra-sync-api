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
import { DiscrepancyEntityType } from '../enums';
import { Discrepancy, DiscrepancyOverview } from '../models';
import { RetrieveDiscrepanciesQuery } from '../queries';

@ApiTenantIdHeader()
@ApiTags('Discrepancies')
@Controller('discrepancies')
export class DiscrepancyScannerController {
    private static readonly DELAY_BETWEEN_ENTITY_SCANS_MS = 1000;

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
            const scanResults: DiscrepancyOverview[] = [];

            for (const [index, entityType] of entityTypeOrder.entries()) {
                if (ScanContext.isAborted()) {
                    const remaining = entityTypeOrder.slice(index);
                    console.warn(
                        `⏹️ Scan ${ScanContext.current()?.scanId} for tenant ${tenantId} aborted, budget expired; not scanned: ${remaining.join(', ')}`,
                    );
                    scanResults.push(...remaining.map((type) => DiscrepancyScannerController.emptyOverview(type)));
                    break;
                }

                try {
                    // No retry here: BeyondTrust calls are retried in HttpClientService only.
                    scanResults.push(await this.scanDiscrepancies(transactionId, tenantId, entityType));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.error(`❌ Discrepancy scan failed for ${entityType}:`, errorMessage);

                    // Add a placeholder result to indicate the entity was attempted but failed
                    scanResults.push(DiscrepancyScannerController.emptyOverview(entityType));
                }

                // Add delay between entity scans to prevent overwhelming the system
                await RetryUtility.delay(DiscrepancyScannerController.DELAY_BETWEEN_ENTITY_SCANS_MS).catch(
                    () => undefined,
                );
            }

            console.log(`🎉 Completed all discrepancy scans: ${scanResults.length} entity types processed`);

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

        return this.withScanBudget(tenantId, async () => {
            try {
                return await this.commandBus.execute<ScanDiscrepancyCommand, DiscrepancyOverview>(
                    new ScanDiscrepancyCommand(transactionId, tenantId, entityType),
                );
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`❌ Command execution failed for ${entityType}:`, errorMessage);

                // Return empty result for timeout/connectivity issues to allow scan/all to continue
                if (errorMessage.includes('timeout') || errorMessage.includes('connectivity')) {
                    console.warn(`⚠️ Returning empty result for ${entityType} due to timeout/connectivity issues`);
                    return DiscrepancyScannerController.emptyOverview(entityType);
                }

                // Re-throw other errors (validation errors, etc.)
                throw error;
            }
        });
    }

    /**
     * Runs a scan within the cycle budget (DISCREPANCY_SCAN_CYCLE_BUDGET_IN_MS). A per-type scan called from
     * scanAllDiscrepancies joins the budget of the surrounding cycle.
     */
    private withScanBudget<T>(tenantId: number, operation: () => Promise<T>): Promise<T> {
        return ScanContext.runWithBudget(
            {
                scanId: UuidUtility.generate(),
                tenantId,
                budgetInMs: this.appConfigService.discrepancy.scan.cycleBudgetInMs,
            },
            operation,
        );
    }

    private static emptyOverview(entityType: DiscrepancyEntityType): DiscrepancyOverview {
        return {
            entityType,
            totalBtData: 0,
            totalDbData: 0,
            identicalIds: [],
            onlyInExternalIds: [],
            onlyInInternalIds: [],
            mismatchedIds: [],
        };
    }
}
