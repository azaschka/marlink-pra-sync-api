import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { BeyondtrustInstanceBackupController } from './controllers/beyondtrust-instance-backup.controller';
import { QueryHandlers } from './queries/handlers';
import { BeyondtrustInstanceBackupEntity } from './repositories/entities';
import { BeyondtrustInstanceBackupRepositoryService } from './repositories/services/beyondtrust-instance-backup-repository.service';
import { BackupRetentionJob } from './services/backup-retention.job';
import { BackupRetentionService } from './services/backup-retention.service';

@Module({
    // SchedulerRegistry comes from ScheduleModule.forRoot() (global, imported by DiscrepancyModule).
    imports: [TypeOrmModule.forFeature([BeyondtrustInstanceBackupEntity]), AppConfigModule],
    controllers: [BeyondtrustInstanceBackupController],
    providers: [
        ...QueryHandlers,
        ...CommandHandlers,
        BeyondtrustInstanceBackupRepositoryService,
        BackupRetentionService,
        BackupRetentionJob,
    ],
})
export class BeyondtrustInstanceBackupModule {}
