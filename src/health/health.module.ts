import { Module } from '@nestjs/common';
import { AppConfigModule } from '../app-config/app-config.module';
import { DatabaseHealthCheck } from './checks/database.health-check';
import { StorageHealthCheck } from './checks/storage.health-check';
import { HealthController } from './controllers/health.controller';
import { HealthService } from './services/health.service';
import { MemorySamplerService } from './services/memory-sampler.service';

@Module({
    imports: [AppConfigModule],
    controllers: [HealthController],
    providers: [HealthService, DatabaseHealthCheck, StorageHealthCheck, MemorySamplerService],
})
export class HealthModule {}
