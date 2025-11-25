import { Controller, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    DiskHealthIndicator,
    HealthCheck,
    HealthCheckResult,
    HealthCheckService,
    MemoryHealthIndicator,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { AppConfigService } from '../../app-config/services/app-config.service';

@ApiTags('Health')
@Controller('health')
@UsePipes(new ValidationPipe({ transform: true }))
export class HealthController {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly healthCheckService: HealthCheckService,
        private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
        private readonly diskHealthIndicator: DiskHealthIndicator,
        private readonly memoryHealthIndicator: MemoryHealthIndicator,
    ) {}

    @Get()
    @HealthCheck()
    public async checkHealth(): Promise<HealthCheckResult> {
        // Use Promise.race to timeout health checks and prevent hanging
        const healthCheckPromise = this.healthCheckService.check([
            async () => this.typeOrmHealthIndicator.pingCheck('database', { timeout: 3000 }),
            async () =>
                this.diskHealthIndicator.checkStorage('storage', {
                    thresholdPercent: this.appConfigService.health.diskStorageUsageThresholdInPercent / 100,
                    path: '/',
                }),
            async () =>
                this.memoryHealthIndicator.checkHeap(
                    'memoryHeap',
                    this.appConfigService.health.memoryHeapUsageThresholdInMB * 1024 * 1024, // Convert MB to bytes
                ),
        ]);

        // Overall health check timeout (5 seconds)
        const timeoutPromise = new Promise<HealthCheckResult>((_, reject) => {
            setTimeout(() => reject(new Error('Health check timeout after 5 seconds')), 5000);
        });

        try {
            return await Promise.race([healthCheckPromise, timeoutPromise]);
        } catch (error) {
            console.error('❌ Health check failed:', error);
            throw error;
        }
    }
}
