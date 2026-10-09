import { BeforeApplicationShutdown, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { BackupRetentionService } from './backup-retention.service';

/** Schedules the backup retention daily (BACKUP_RETENTION_CRON, default 04:05 Europe/Berlin). */
@Injectable()
export class BackupRetentionJob implements OnApplicationBootstrap, BeforeApplicationShutdown {
    private static readonly JOB_NAME = 'backupRetention';

    private readonly logger = new Logger(BackupRetentionJob.name);
    private job: CronJob | undefined;

    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly appConfigService: AppConfigService,
        private readonly backupRetentionService: BackupRetentionService,
    ) {}

    public onApplicationBootstrap(): void {
        const { cronExpression, timezone } = this.appConfigService.backupRetention;

        this.job = CronJob.from({
            cronTime: cronExpression,
            onTick: async () => {
                try {
                    await this.backupRetentionService.run();
                } catch (error) {
                    // IMPORTANT: Do not throw the error, otherwise it will kill the process
                    this.logger.error(`[${BackupRetentionJob.JOB_NAME}] failed: ${(error as Error).message}`);
                }
            },
            timeZone: timezone,
            waitForCompletion: true,
            start: false,
        });
        this.schedulerRegistry.addCronJob(BackupRetentionJob.JOB_NAME, this.job);
        this.job.start();
    }

    // Like the scan job: no new run once the shutdown has started, before TypeORM closes the DataSource.
    public beforeApplicationShutdown(): void {
        void this.job?.stop();
    }
}
