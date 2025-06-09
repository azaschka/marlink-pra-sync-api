import { Controller, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { SyncController } from './sync.controller';

@Controller('sync-job')
export class SyncJobController implements OnModuleInit {
    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly appConfigService: AppConfigService,
        private readonly syncController: SyncController,
    ) {}

    public onModuleInit(): void {
        const cronJobMap = [
            {
                name: 'syncUsers',
                cronExpression: this.appConfigService.sync.userCronJobExpression,
                func: this.syncController.syncUsers.bind(this.syncController),
            },
            {
                name: 'syncTeams',
                cronExpression: this.appConfigService.sync.teamCronJobExpression,
                func: this.syncController.syncTeams.bind(this.syncController),
            },
            {
                name: 'syncGroupPolicies',
                cronExpression: this.appConfigService.sync.groupPolicyCronJobExpression,
                func: this.syncController.syncGroupPolicies.bind(this.syncController),
            },
            {
                name: 'syncJumpGroups',
                cronExpression: this.appConfigService.sync.jumpGroupCronJobExpression,
                func: this.syncController.syncJumpGroups.bind(this.syncController),
            },
            {
                name: 'syncJumpPolicies',
                cronExpression: this.appConfigService.sync.jumpPolicyCronJobExpression,
                func: this.syncController.syncJumpPolicies.bind(this.syncController),
            },
            {
                name: 'syncJumpoints',
                cronExpression: this.appConfigService.sync.jumpointCronJobExpression,
                func: this.syncController.syncJumpoints.bind(this.syncController),
            },
            {
                name: 'syncJumpItemsRemoteRdps',
                cronExpression: this.appConfigService.sync.jumpItem.remoteRdpCronJobExpression,
                func: this.syncController.syncJumpItemsRemoteRdps.bind(this.syncController),
            },
        ];

        cronJobMap.forEach(({ name, cronExpression, func }) => {
            const job = new CronJob(
                cronExpression,
                async () => {
                    await func();
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
