import { Controller, Delete, Get, HttpCode, HttpStatus, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DateUtility } from '../../shared/utilities';
import { DeleteLogsDtoInput, RetrieveLogsDtoInput } from '../dtos/inputs';
import { LogsRetrievedDtoOutput } from '../dtos/outputs';
import { LogService } from '../services/log.service';

@ApiTags('Logs')
@Controller('logs')
@UsePipes(new ValidationPipe({ transform: true }))
export class LogController {
    // Bus subscriptions live in LogBusSubscriberService.
    constructor(private readonly logService: LogService) {}

    @Get()
    @ApiOkResponse({ type: LogsRetrievedDtoOutput })
    public async retrieveLogs(@Query() dto: RetrieveLogsDtoInput): Promise<LogsRetrievedDtoOutput> {
        const logs = await this.logService.retrieveLogs(
            dto.pageSize,
            dto.pageNumber,
            dto.creationDateFrom,
            dto.creationDateTo,
            dto.sortOrderType,
        );

        const totalCount = await this.logService.countLogs(dto.creationDateFrom, dto.creationDateTo);

        return {
            logs: logs,
            totalCount: totalCount,
        };
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({ description: 'Indicates the site manager was successfully removed.' })
    public async clearLogs(@Query() dto: DeleteLogsDtoInput): Promise<void> {
        await this.logService.clearLogs(dto.creationDateFrom, dto.creationDateTo ?? DateUtility.getCurrentUtcDate());
    }
}
