import { SchedulerRegistry } from '@nestjs/schedule';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { SyncJobController } from './sync-job.controller';
import { SyncController } from './sync.controller';

describe('SyncJobController', () => {
    let controller: SyncJobController;
    let schedulerRegistry: SchedulerRegistry;
    let appConfigService: AppConfigService;
    let syncController: SyncController;

    beforeEach(() => {
        schedulerRegistry = mockSchedulerRegistry();
        appConfigService = mockAppConfigService();
        syncController = mockSyncController();

        controller = new SyncJobController(schedulerRegistry, appConfigService, syncController);
    });

    it('should register cron jobs on module init', () => {
        const schedulerRegistryAddCronJob = jest.spyOn(schedulerRegistry, 'addCronJob');

        controller.onModuleInit();

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

function mockSyncController() {
    const syncController = {} as SyncController;
    syncController.syncAll = jest.fn();

    return syncController;
}
