import { BadRequestException, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiTenantIdHeader, TenantIdHeader, TransactionIdHeader } from '../../core/decorators';
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
    private static readonly RETRY_DELAY_BETWEEN_ATTEMPTS_MS = 10000;
    private static readonly MAX_RETRY_ATTEMPTS = 3;
    private static readonly DELAY_BETWEEN_ENTITY_SCANS_MS = 1000;

    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
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
            DiscrepancyEntityType.JumpGroup,
            DiscrepancyEntityType.JumpItemProtocolTunnelJump,
            DiscrepancyEntityType.JumpItemRemoteRdp,
            DiscrepancyEntityType.JumpItemRemoteVnc,
            DiscrepancyEntityType.JumpItemShellJump,
            DiscrepancyEntityType.JumpItemWebJump,
            DiscrepancyEntityType.JumpClient,
            DiscrepancyEntityType.JumpClientInstaller,
        ];

        const scanResults = [];

        for (const entityType of entityTypeOrder) {
            try {
                const scanResult = await RetryUtility.executeWithRetry(
                    () => this.scanDiscrepancies(transactionId, tenantId, entityType),
                    `Scan for ${entityType}`,
                );
                scanResults.push(scanResult);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`❌ Discrepancy scan failed for ${entityType}:`, errorMessage);
                console.log(`⏭️ Continuing with next entity type...`);

                // Add a placeholder result to indicate the entity was attempted but failed
                scanResults.push({
                    entityType,
                    totalBtData: 0,
                    totalDbData: 0,
                    identicalIds: [],
                    onlyInExternalIds: [],
                    onlyInInternalIds: [],
                    mismatchedIds: [],
                });
            }

            // Add delay between entity scans to prevent overwhelming the system
            await RetryUtility.delay(DiscrepancyScannerController.DELAY_BETWEEN_ENTITY_SCANS_MS);
        }

        console.log(`🎉 Completed all discrepancy scans: ${scanResults.length} entity types processed`);

        return scanResults;
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

        try {
            const result = await RetryUtility.executeWithRetry(
                () =>
                    this.commandBus.execute<ScanDiscrepancyCommand, DiscrepancyOverview>(
                        new ScanDiscrepancyCommand(transactionId, tenantId, entityType),
                    ),
                `Command execution for ${entityType}`,
                DiscrepancyScannerController.MAX_RETRY_ATTEMPTS,
                DiscrepancyScannerController.RETRY_DELAY_BETWEEN_ATTEMPTS_MS,
            );
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Command execution failed for ${entityType}:`, errorMessage);

            // Return empty result for timeout/connectivity issues to allow scan/all to continue
            if (errorMessage.includes('timeout') || errorMessage.includes('connectivity')) {
                console.warn(`⚠️ Returning empty result for ${entityType} due to timeout/connectivity issues`);
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

            // Re-throw other errors (validation errors, etc.)
            throw error;
        }
    }
}
