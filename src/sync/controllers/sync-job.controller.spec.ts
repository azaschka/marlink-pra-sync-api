import { QueryBus } from '@nestjs/cqrs';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { PaginationUtility } from '../../shared/utilities';
import { SyncJobController } from './sync-job.controller';
import { SyncController } from './sync.controller';

describe('SyncJobController', () => {
    let controller: SyncJobController;
    let schedulerRegistry: SchedulerRegistry;
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let syncController: SyncController;

    beforeEach(() => {
        schedulerRegistry = mockSchedulerRegistry();
        appConfigService = mockAppConfigService();
        syncController = mockSyncController();
        queryBus = mockQueryBus();

        controller = new SyncJobController(schedulerRegistry, appConfigService, queryBus, syncController);
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

function mockSyncController() {
    const syncController = {} as SyncController;
    syncController.syncAll = jest.fn();

    return syncController;
}
