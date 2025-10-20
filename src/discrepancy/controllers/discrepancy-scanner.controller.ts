import { BadRequestException, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { ApiTenantIdHeader, TenantIdHeader, TransactionIdHeader } from '../../core/decorators';
import { UuidUtility } from '../../shared/utilities';
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
    ): Promise<unknown> {
        const scanOrders = [
            {
                name: 'jump-policies',
                func: () => this.scanDiscrepancies(transactionId, tenantId, DiscrepancyEntityType.JumpPolicy),
            },
            {
                name: 'jump-groups',
                func: () => this.scanDiscrepancies(transactionId, tenantId, DiscrepancyEntityType.JumpGroup),
            },
            {
                name: 'jumpoints',
                func: () => this.scanDiscrepancies(transactionId, tenantId, DiscrepancyEntityType.Jumpoint),
            },
            {
                name: 'protocol-tunnel-jumps',
                func: () =>
                    this.scanDiscrepancies(transactionId, tenantId, DiscrepancyEntityType.JumpItemProtocolTunnelJump),
            },
            {
                name: 'remote-rdps',
                func: () => this.scanDiscrepancies(transactionId, tenantId, DiscrepancyEntityType.JumpItemRemoteRdp),
            },
            {
                name: 'remote-vncs',
                func: () => this.scanDiscrepancies(transactionId, tenantId, DiscrepancyEntityType.JumpItemRemoteVnc),
            },
            {
                name: 'shell-jumps',
                func: () => this.scanDiscrepancies(transactionId, tenantId, DiscrepancyEntityType.JumpItemShellJump),
            },
            {
                name: 'web-jumps',
                func: () => this.scanDiscrepancies(transactionId, tenantId, DiscrepancyEntityType.JumpItemWebJump),
            },
            {
                name: 'jump-clients',
                func: () => this.scanDiscrepancies(transactionId, tenantId, DiscrepancyEntityType.JumpClient),
            },
            {
                name: 'jump-client-installers',
                func: () => this.scanDiscrepancies(transactionId, tenantId, DiscrepancyEntityType.JumpClientInstaller),
            },
            {
                name: 'users',
                func: () => this.scanDiscrepancies(transactionId, tenantId, DiscrepancyEntityType.User),
            },
            {
                name: 'teams',
                func: () => this.scanDiscrepancies(transactionId, tenantId, DiscrepancyEntityType.Team),
            },
            {
                name: 'group-policies',
                func: () => this.scanDiscrepancies(transactionId, tenantId, DiscrepancyEntityType.GroupPolicy),
            },
        ];

        const scanResults = [];

        for (const scan of scanOrders) {
            for (let attempt = 1; attempt <= this.appConfigService.sync.cronJobRetryAttempts; attempt++) {
                try {
                    console.log(`Starting discrepancy scan for ${scan.name}, attempt ${attempt}`);

                    const scanResult = await scan.func();
                    scanResults.push({ name: scan.name, ...scanResult });

                    break; // success, move to next function
                } catch (error) {
                    console.error(`Discrepancy scan failed on attempt ${attempt} for ${scan.name}:`, error);

                    if (attempt === this.appConfigService.sync.cronJobRetryAttempts) {
                        console.error(`Discrepancy scan attempts failed for ${scan.name}.`);
                    }

                    await new Promise((r) => setTimeout(r, this.appConfigService.sync.cronJobRetryDelayInMs));
                }
            }
        }

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
            throw new BadRequestException(`Invalid entity type: ${entityType}`);
        }

        return await this.commandBus.execute<ScanDiscrepancyCommand, DiscrepancyOverview>(
            new ScanDiscrepancyCommand(transactionId, tenantId, entityType),
        );
    }
}
