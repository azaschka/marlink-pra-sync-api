import { Controller, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { BeyondtrustInstance } from '../../beyondtrust-instance/models';
import { RetrieveBeyondtrustInstancesQuery } from '../../beyondtrust-instance/queries';
import { PaginationUtility, RetryUtility, UuidUtility } from '../../shared/utilities';
import { DiscrepancyScannerController } from './discrepancy-scanner.controller';

@Controller('discrepancies/scan/job')
export class DiscrepancyScannerJobController implements OnApplicationBootstrap {
    private static readonly MAX_PAGE_SIZE = 50;
    private static readonly RETRY_DELAY_BETWEEN_ATTEMPTS_MS = 10000;
    private static readonly MAX_RETRY_ATTEMPTS = 3;

    private readonly logger = new Logger(DiscrepancyScannerJobController.name);

    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly discrepancyScannerController: DiscrepancyScannerController,
    ) {}

    public async onApplicationBootstrap(): Promise<void> {
        const beyondtrustInstances = await this.getAllBeyondtrustInstances();

        const cronJobMap = [
            {
                name: 'scanAll',
                cronExpression: this.appConfigService.discrepancy.scan.cronJobExpressions,
                func: this.discrepancyScannerController.scanAllDiscrepancies.bind(this.discrepancyScannerController),
            },
        ];

        cronJobMap.forEach(({ name, cronExpression, func }) => {
            const job = new CronJob(
                cronExpression,
                async () => {
                    // Generate new transaction ID per cron run for better tracing
                    const transactionId = UuidUtility.generate();

                    // Log memory usage before job execution
                    const memBefore = process.memoryUsage();
                    this.logger.log(`[${name}] started with transaction ID: ${transactionId}`);
                    this.logger.debug(`[${name}] Memory before: ${Math.round(memBefore.heapUsed / 1024 / 1024)} MB`);

                    const startTime = Date.now();

                    try {
                        for (const beyondtrustInstance of beyondtrustInstances) {
                            try {
                                await func(transactionId, beyondtrustInstance.id);
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

                        // Log memory usage and duration after job execution
                        const memAfter = process.memoryUsage();
                        const duration = Date.now() - startTime;
                        this.logger.log(`[${name}] finished successfully in ${Math.round(duration / 1000)}s`);
                        this.logger.debug(
                            `[${name}] Memory after: ${Math.round(memAfter.heapUsed / 1024 / 1024)} MB ` +
                                `(delta: ${Math.round((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024)} MB)`,
                        );

                        // Force garbage collection if memory increased significantly (if --expose-gc flag is set)
                        if (global.gc && memAfter.heapUsed - memBefore.heapUsed > 100 * 1024 * 1024) {
                            this.logger.debug(`[${name}] Running garbage collection`);
                            global.gc();
                        }
                    } catch (err) {
                        // IMPORTANT: Do not throw the error, otherwise it will kill the process
                        const duration = Date.now() - startTime;
                        this.logger.error(
                            `[${name}] failed after ${Math.round(duration / 1000)}s: ${(err as Error).message}`,
                            err as Error,
                        );
                    }
                },
                null,
                undefined,
                this.appConfigService.discrepancy.scan.cronJobTimezone,
            );

            this.schedulerRegistry.addCronJob(name, job);
            job.start();
        });
    }

    private async getAllBeyondtrustInstances(): Promise<BeyondtrustInstance[]> {
        return await RetryUtility.executeWithRetry(
            async () => {
                return await PaginationUtility.queryUntilLastPage((pageNumber) => {
                    return this.queryBus.execute<RetrieveBeyondtrustInstancesQuery, BeyondtrustInstance[]>(
                        new RetrieveBeyondtrustInstancesQuery(
                            UuidUtility.generate(),
                            DiscrepancyScannerJobController.MAX_PAGE_SIZE,
                            pageNumber,
                        ),
                    );
                });
            },
            'Fetch all BeyondTrust instances for cron job setup',
            DiscrepancyScannerJobController.MAX_RETRY_ATTEMPTS,
            DiscrepancyScannerJobController.RETRY_DELAY_BETWEEN_ATTEMPTS_MS,
        );
    }
}
