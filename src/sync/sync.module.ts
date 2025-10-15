import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { SyncJobController } from './controllers/sync-job.controller';
import { SyncController } from './controllers/sync.controller';
import { SyncDiscrepancyEntity } from './repositories/entities';
import { SyncDiscrepancyRepositoryService } from './repositories/services/sync-discrepancy-repository.service';

@Module({
    imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([SyncDiscrepancyEntity]), AppConfigModule],
    controllers: [SyncController, SyncJobController],
    providers: [SyncController, SyncDiscrepancyRepositoryService, ...CommandHandlers],
})
export class SyncModule {}
