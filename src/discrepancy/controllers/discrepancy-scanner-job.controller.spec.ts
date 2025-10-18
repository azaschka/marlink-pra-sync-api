import { QueryBus } from '@nestjs/cqrs';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { PaginationUtility } from '../../shared/utilities';
import { DiscrepancyScannerJobController } from './discrepancy-scanner-job.controller';
import { DiscrepancyScannerController } from './discrepancy-scanner.controller';

describe('DiscrepancyScannerJobController', () => {
    let controller: DiscrepancyScannerJobController;
    let schedulerRegistry: SchedulerRegistry;
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let discrepancyScannerController: DiscrepancyScannerController;

    beforeEach(() => {
        schedulerRegistry = mockSchedulerRegistry();
        appConfigService = mockAppConfigService();
        discrepancyScannerController = mockDiscrepancyScannerController();
        queryBus = mockQueryBus();

        controller = new DiscrepancyScannerJobController(
            schedulerRegistry,
            appConfigService,
            queryBus,
            discrepancyScannerController,
        );
    });

    it('should register cron jobs on module init', async () => {
        PaginationUtility.queryUntilLastPage = jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]);
        const schedulerRegistryAddCronJob = jest.spyOn(schedulerRegistry, 'addCronJob');

        await controller.onApplicationBootstrap();

        expect(schedulerRegistryAddCronJob).toHaveBeenCalledTimes(1);
    });
});

function mockSchedulerRegistry() {
    const schedulerRegistry = {} as SchedulerRegistry;
    schedulerRegistry.addCronJob = jest.fn();

    return schedulerRegistry;
}

function mockAppConfigService() {
    const appConfigService = {
        sync: {
            cronJobTimezone: 'Europe/Berlin',
            cronJobExpressions: '0 * * * *',
        },
    } as unknown as AppConfigService;

    return appConfigService;
}

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn();

    return queryBus;
}

function mockDiscrepancyScannerController() {
    const discrepancyScannerController = {} as DiscrepancyScannerController;
    discrepancyScannerController.scanAllDiscrepancies = jest.fn();

    return discrepancyScannerController;
}
