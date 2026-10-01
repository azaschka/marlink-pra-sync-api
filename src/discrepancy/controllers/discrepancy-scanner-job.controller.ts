import { Controller, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { BeyondtrustInstance } from '../../beyondtrust-instance/models';
import { RetrieveBeyondtrustInstancesQuery } from '../../beyondtrust-instance/queries';
import { PaginationUtility, RetryUtility, UuidUtility } from '../../shared/utilities';
import { DiscrepancyScanCycleService } from '../services/discrepancy-scan-cycle.service';
import { DiscrepancyScanOutcome } from '../services/discrepancy-scan-outcome';

@Controller('discrepancies/scan/job')
export class DiscrepancyScannerJobController implements OnApplicationBootstrap, OnApplicationShutdown {
    private static readonly JOB_NAME = 'scanAll';
    private static readonly MAX_PAGE_SIZE = 50;

    private readonly logger = new Logger(DiscrepancyScannerJobController.name);
    private job: CronJob | undefined;

    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly discrepancyScanCycleService: DiscrepancyScanCycleService,
    ) {}

    public onApplicationBootstrap(): void {
        // waitForCompletion: while a tick is still running, cron skips the next one instead of starting a second,
        // overlapping run. Per tenant, ScanCoordinatorService additionally skips tenants that are still busy.
        this.job = CronJob.from({
            cronTime: this.appConfigService.discrepancy.scan.cronJobExpressions,
            onTick: () => this.runTick(),
            timeZone: this.appConfigService.discrepancy.scan.cronJobTimezone,
            waitForCompletion: true,
            start: false,
        });

        this.schedulerRegistry.addCronJob(DiscrepancyScannerJobController.JOB_NAME, this.job);
        this.job.start();
    }

    public onApplicationShutdown(): void {
        void this.job?.stop();
    }

    /**
     * One cron tick: one cycle per BeyondTrust instance. The instances are read on every tick, so instances
     * added or removed after the start are picked up without a restart.
     */
    public async runTick(): Promise<void> {
        const name = DiscrepancyScannerJobController.JOB_NAME;
        // Generate new transaction ID per cron run for better tracing
        const transactionId = UuidUtility.generate();
        const startTime = Date.now();
        this.logger.log(`[${name}] started with transaction ID: ${transactionId}`);

        try {
            const beyondtrustInstances = await this.getAllBeyondtrustInstances();
            let allSucceeded = true;

            for (const beyondtrustInstance of beyondtrustInstances) {
                try {
                    const outcome = await this.discrepancyScanCycleService.runCycle(
                        transactionId,
                        beyondtrustInstance.id,
                        'cron',
                    );

                    allSucceeded &&=
                        outcome.status === 'completed' &&
                        !outcome.backgroundUnfinished &&
                        DiscrepancyScanOutcome.summarize(outcome.overviews).allSucceeded;
                } catch (error) {
                    allSucceeded = false;
                    // IMPORTANT: Do not throw the error, otherwise it will kill the process
                    this.logger.error(
                        `[${name}] failed for BeyondTrust instance ID ${beyondtrustInstance.id}: ${
                            (error as Error).message
                        }`,
                        error as Error,
                    );
                }
            }

            // "successfully" only if nothing failed or was skipped; the per-tenant lines carry the details.
            this.logger.log(
                `[${name}] finished ${allSucceeded ? 'successfully' : 'with failures or skipped tenants'} in ${Math.round(
                    (Date.now() - startTime) / 1000,
                )}s`,
            );
        } catch (err) {
            // IMPORTANT: Do not throw the error, otherwise it will kill the process
            this.logger.error(
                `[${name}] failed after ${Math.round((Date.now() - startTime) / 1000)}s: ${(err as Error).message}`,
                err as Error,
            );
        }
    }

    private getAllBeyondtrustInstances(): Promise<BeyondtrustInstance[]> {
        return RetryUtility.executeDatabaseOperation(
            () =>
                PaginationUtility.queryUntilLastPage((pageNumber) =>
                    this.queryBus.execute<RetrieveBeyondtrustInstancesQuery, BeyondtrustInstance[]>(
                        new RetrieveBeyondtrustInstancesQuery(
                            UuidUtility.generate(),
                            DiscrepancyScannerJobController.MAX_PAGE_SIZE,
                            pageNumber,
                        ),
                    ),
                ),
            'Fetch all BeyondTrust instances for the scan cycle',
        );
    }
}
