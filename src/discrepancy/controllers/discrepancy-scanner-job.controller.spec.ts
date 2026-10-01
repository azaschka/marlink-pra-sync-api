import { QueryBus } from '@nestjs/cqrs';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { DiscrepancyScanCycleService } from '../services/discrepancy-scan-cycle.service';
import { DiscrepancyScannerJobController } from './discrepancy-scanner-job.controller';

describe('DiscrepancyScannerJobController', () => {
    let controller: DiscrepancyScannerJobController;
    let schedulerRegistry: { addCronJob: jest.Mock };
    let queryBus: { execute: jest.Mock };
    let cycleService: { runCycle: jest.Mock };

    beforeEach(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        schedulerRegistry = { addCronJob: jest.fn() };
        queryBus = { execute: jest.fn() };
        cycleService = {
            runCycle: jest.fn().mockResolvedValue({
                status: 'completed',
                scanId: 'abc',
                overviews: [],
                background: {},
                backgroundUnfinished: false,
            }),
        };
        controller = new DiscrepancyScannerJobController(
            schedulerRegistry as unknown as SchedulerRegistry,
            {
                discrepancy: { scan: { cronJobTimezone: 'Europe/Berlin', cronJobExpressions: '0 * * * *' } },
            } as unknown as AppConfigService,
            queryBus as unknown as QueryBus,
            cycleService as unknown as DiscrepancyScanCycleService,
        );
    });

    afterEach(() => {
        controller.onApplicationShutdown();
        jest.restoreAllMocks();
    });

    it('registers one cron job that waits for the completion of a running tick', () => {
        controller.onApplicationBootstrap();

        expect(schedulerRegistry.addCronJob).toHaveBeenCalledTimes(1);
        const job = (schedulerRegistry.addCronJob.mock.calls as unknown[][])[0]?.[1] as CronJob;
        expect(job.waitForCompletion).toBe(true);
        expect(job.isActive).toBe(true);
    });

    it('reads the BeyondTrust instances on every tick and runs one cycle per instance', async () => {
        queryBus.execute
            .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([{ id: 3 }])
            .mockResolvedValueOnce([]);

        await controller.runTick();
        await controller.runTick();

        const calls = cycleService.runCycle.mock.calls as unknown[][];
        expect(calls.map((call) => call[1])).toEqual([1, 2, 3]);
        expect(calls.every((call) => call[2] === 'cron')).toBe(true);
    });

    it('keeps going with the next instance when a cycle throws', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
        queryBus.execute.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]).mockResolvedValueOnce([]);
        cycleService.runCycle.mockRejectedValueOnce(new Error('boom'));

        await expect(controller.runTick()).resolves.toBeUndefined();

        expect(cycleService.runCycle).toHaveBeenCalledTimes(2);
    });
});
