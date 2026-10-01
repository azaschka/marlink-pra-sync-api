import {
    BadRequestException,
    ConflictException,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiConflictResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiTenantIdHeader, TenantIdHeader, TransactionIdHeader } from '../../core/decorators';
import { UuidUtility } from '../../shared/utilities';
import { RetrieveDiscrepanciesDtoInput } from '../dtos/inputs';
import { DiscrepancyDtoOutput, DiscrepancyOverviewDtoOutput } from '../dtos/outputs';
import { DiscrepancyEntityType } from '../enums';
import { Discrepancy, DiscrepancyOverview } from '../models';
import { RetrieveDiscrepanciesQuery } from '../queries';
import { DiscrepancyScanCycleService } from '../services/discrepancy-scan-cycle.service';

@ApiTenantIdHeader()
@ApiTags('Discrepancies')
@Controller('discrepancies')
export class DiscrepancyScannerController {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly discrepancyScanCycleService: DiscrepancyScanCycleService,
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
    @ApiConflictResponse({ description: 'A scan cycle or an exclusive operation is already running for the tenant.' })
    @HttpCode(HttpStatus.OK)
    public async scanAllDiscrepancies(
        @TransactionIdHeader() transactionId: string = UuidUtility.generate(),
        @TenantIdHeader() tenantId: number,
    ): Promise<DiscrepancyOverview[]> {
        const outcome = await this.discrepancyScanCycleService.runCycle(transactionId, tenantId, 'manual');

        if (outcome.status === 'skipped') {
            throw new ConflictException({
                message: `A scan cannot start now: ${outcome.reason}`,
                scanId: outcome.activeScanId,
            });
        }

        return outcome.overviews;
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

        // Joins a scan of the same tenant and type that is already in flight. The handler reports BeyondTrust and
        // database failures as an overview with state failed or aborted; the ID lists of such an overview are
        // empty and mean "unknown", not "nothing found".
        return this.discrepancyScanCycleService.scanType(transactionId, tenantId, entityType);
    }
}
