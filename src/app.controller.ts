import { Controller, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import {
    DiskHealthIndicator,
    HealthCheck,
    HealthCheckResult,
    HealthCheckService,
    MemoryHealthIndicator,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { AppConfigService } from './app-config/services/app-config.service';

@ApiTags('Health')
@Controller('health')
@UsePipes(new ValidationPipe({ transform: true }))
export class AppController {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly healthCheckService: HealthCheckService,
        private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
        private readonly diskHealthIndicator: DiskHealthIndicator,
        private readonly memoryHealthIndicator: MemoryHealthIndicator,
    ) {
        this.commandBus.subscribe((command) => {
            console.log(`\x1b[34mCommand received:\n${JSON.stringify(command, null, 2)}\x1b[0m`);
        });

        this.queryBus.subscribe((query) => {
            console.log(`\x1b[35mQuery received:\n${JSON.stringify(query, null, 2)}\x1b[0m`);
        });

        this.eventBus.subscribe((event) => {
            console.log(`\x1b[32mEvent received:\n${JSON.stringify(event, null, 2)}\x1b[0m`);
        });
    }

    @Get()
    @HealthCheck()
    public checkHealth(): Promise<HealthCheckResult> {
        return this.healthCheckService.check([
            async () => this.typeOrmHealthIndicator.pingCheck('database'),
            async () =>
                this.diskHealthIndicator.checkStorage('storage', {
                    thresholdPercent: this.appConfigService.health.diskStorageUsageThresholdInPercent / 100,
                    path: '/',
                }),
            async () =>
                this.memoryHealthIndicator.checkHeap(
                    'memory_heap',
                    this.appConfigService.health.memoryHeapUsageThresholdInMB * 1024 * 1024, // Convert MB to bytes
                ),
        ]);
    }
}
