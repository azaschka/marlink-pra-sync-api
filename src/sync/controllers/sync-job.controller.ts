import { Controller, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { SyncController } from './sync.controller';

@Controller('sync-job')
export class SyncJobController implements OnModuleInit {
    private readonly logger = new Logger(SyncJobController.name);

    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly appConfigService: AppConfigService,
        private readonly syncController: SyncController,
    ) {}

    public onModuleInit(): void {
        const cronJobMap = [
            {
                name: 'syncAll',
                cronExpression: this.appConfigService.sync.cronJobExpressions,
                func: this.syncController.syncAll.bind(this.syncController),
            },
        ];

        cronJobMap.forEach(({ name, cronExpression, func }) => {
            const job = new CronJob(
                cronExpression,
                async () => {
                    this.logger.log(`[${name}] started`);
                    try {
                        await func();
                        this.logger.log(`[${name}] finished`);
                    } catch (err) {
                        // IMPORTANT: Do not throw the error, otherwise it will kill the process
                        this.logger.error(`[${name}] failed: ${(err as Error).message}`, err as Error);
                    }
                },
                null,
                undefined,
                this.appConfigService.sync.cronJobTimezone,
            );

            this.schedulerRegistry.addCronJob(name, job);
            job.start();
        });
    }
}
