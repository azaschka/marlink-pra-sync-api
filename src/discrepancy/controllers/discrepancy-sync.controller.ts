import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiConflictResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiTenantIdHeader, TenantIdHeader, TransactionIdHeader } from '../../core/decorators';
import { NonEmptyBodyPipe } from '../../shared/pipes';
import { UuidUtility } from '../../shared/utilities';
import { SyncAllExternalDiscrepanciesCommand, SyncAllExternalResult, SyncDiscrepancyCommand } from '../commands';
import { SyncDiscrepancyDtoInput } from '../dtos/inputs';
import { ScanCoordinatorService } from '../services/scan-coordinator.service';

@ApiTenantIdHeader()
@ApiTags('Discrepancies')
@Controller('discrepancies')
export class DiscrepancySyncController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly scanCoordinatorService: ScanCoordinatorService,
    ) {}

    @Post('sync/all-external')
    @ApiOkResponse()
    @ApiConflictResponse({ description: 'A scan cycle or another sync-all-external is running for the tenant.' })
    @HttpCode(HttpStatus.OK)
    public async syncAllExternalDiscrepancies(
        @TransactionIdHeader() transactionId: string = UuidUtility.generate(),
        @TenantIdHeader() tenantId: number,
    ): Promise<SyncAllExternalResult> {
        // Exclusive per tenant: 409 while a scan cycle runs, and cycles are skipped while this runs.
        return await this.scanCoordinatorService.runExclusive(tenantId, 'sync-all-external', () =>
            this.commandBus.execute<SyncAllExternalDiscrepanciesCommand, SyncAllExternalResult>(
                new SyncAllExternalDiscrepanciesCommand(transactionId, tenantId),
            ),
        );
    }

    @Post(':id/sync')
    @ApiParam({
        name: 'id',
        type: Number,
        required: true,
        description: 'The id of the discrepancy.',
    })
    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    public async syncDiscrepancy(
        @TransactionIdHeader() transactionId: string = UuidUtility.generate(),
        @TenantIdHeader() tenantId: number,
        @Param('id') id: number,
        @Body(new NonEmptyBodyPipe()) dtoInput: SyncDiscrepancyDtoInput,
    ): Promise<void> {
        await this.commandBus.execute<SyncDiscrepancyCommand, void>(
            new SyncDiscrepancyCommand(transactionId, tenantId, id, dtoInput.syncType),
        );
    }
}
