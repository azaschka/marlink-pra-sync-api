import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfigModule } from '../app-config/app-config.module';
import { SyncJobController } from './controllers/sync-job.controller';
import { SyncController } from './controllers/sync.controller';

@Module({
    imports: [ScheduleModule.forRoot(), AppConfigModule],
    controllers: [SyncController, SyncJobController],
    providers: [SyncController],
})
export class SyncModule {}
