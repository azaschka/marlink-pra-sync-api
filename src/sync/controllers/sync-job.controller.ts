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
                name: 'syncJumpClients',
                cronExpression: this.appConfigService.sync.jumpClientCronJobExpression,
                func: this.syncController.syncJumpClients.bind(this.syncController),
            },
            {
                name: 'syncJumpClientInstallers',
                cronExpression: this.appConfigService.sync.jumpClientInstallerCronJobExpression,
                func: this.syncController.syncJumpClientInstallers.bind(this.syncController),
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
                name: 'syncJumpItemsProtocolTunnelJumps',
                cronExpression: this.appConfigService.sync.jumpItem.protocolTunnelJumpCronJobExpression,
                func: this.syncController.syncJumpItemsProtocolTunnelJumps.bind(this.syncController),
            },
            {
                name: 'syncJumpItemsRemoteRdps',
                cronExpression: this.appConfigService.sync.jumpItem.remoteRdpCronJobExpression,
                func: this.syncController.syncJumpItemsRemoteRdps.bind(this.syncController),
            },
            {
                name: 'syncJumpItemsRemoteVncs',
                cronExpression: this.appConfigService.sync.jumpItem.remoteVncCronJobExpression,
                func: this.syncController.syncJumpItemsRemoteVncs.bind(this.syncController),
            },
            {
                name: 'syncJumpItemsShellJumps',
                cronExpression: this.appConfigService.sync.jumpItem.shellJumpCronJobExpression,
                func: this.syncController.syncJumpItemsShellJumps.bind(this.syncController),
            },
            {
                name: 'syncJumpItemsWebJumps',
                cronExpression: this.appConfigService.sync.jumpItem.webJumpCronJobExpression,
                func: this.syncController.syncJumpItemsWebJumps.bind(this.syncController),
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
