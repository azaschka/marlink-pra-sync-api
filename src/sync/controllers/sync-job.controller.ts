import { Controller, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { BeyondtrustInstance } from '../../beyondtrust-instance/models';
import { RetrieveBeyondtrustInstancesQuery } from '../../beyondtrust-instance/queries';
import { PaginationUtility, UuidUtility } from '../../shared/utilities';
import { SyncController } from './sync.controller';

@Controller('sync-job')
export class SyncJobController implements OnApplicationBootstrap {
    private static readonly MAX_PAGE_SIZE = 50;

    private readonly logger = new Logger(SyncJobController.name);

    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly syncController: SyncController,
    ) {}

    public async onApplicationBootstrap(): Promise<void> {
        const beyondtrustInstances = await this.getAllBeyondtrustInstances();

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
                        for (const beyondtrustInstance of beyondtrustInstances) {
                            try {
                                await func(beyondtrustInstance.id);
                            } catch (error) {
                                // IMPORTANT: Do not throw the error, otherwise it will kill the process
                                this.logger.error(
                                    `[${name}] failed for BeyondTrust instance ID ${beyondtrustInstance.id}: ${
                                        (error as Error).message
                                    }`,
                                    error as Error,
                                );
                            }
                        }
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

    private async getAllBeyondtrustInstances(): Promise<BeyondtrustInstance[]> {
        return await PaginationUtility.queryUntilLastPage((pageNumber) => {
            return this.queryBus.execute<RetrieveBeyondtrustInstancesQuery, BeyondtrustInstance[]>(
                new RetrieveBeyondtrustInstancesQuery(
                    UuidUtility.generate(),
                    SyncJobController.MAX_PAGE_SIZE,
                    pageNumber,
                ),
            );
        });
    }
}
