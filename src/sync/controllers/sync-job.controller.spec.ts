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

        expect(schedulerRegistryAddCronJob).toHaveBeenCalledTimes(5);
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
            userCronJobExpression: '0 * * * *',
            teamCronJobExpression: '1 * * * *',
            groupPolicyCronJobExpression: '2 * * * *',
            jumpGroupCronJobExpression: '3 * * * *',
            jumpPolicyCronJobExpression: '4 * * * *',
            cronJobTimezone: 'Europe/Berlin',
        },
    } as unknown as AppConfigService;

    return appConfigService;
}

function mockSyncController() {
    const syncController = {} as SyncController;
    syncController.syncUsers = jest.fn();
    syncController.syncTeams = jest.fn();
    syncController.syncGroupPolicies = jest.fn();
    syncController.syncJumpGroups = jest.fn();
    syncController.syncJumpPolicies = jest.fn();

    return syncController;
}
