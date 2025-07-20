import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { CommandBus, CqrsModule, QueryBus } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from './app-config/app-config.module';
import { AppConfigService } from './app-config/services/app-config.service';
import { AppController } from './app.controller';
import { BeyondtrustInstanceBackupModule } from './beyondtrust-instance-backup/beyondtrust-instance-backup.module';
import { BeyondtrustInstanceModule } from './beyondtrust-instance/beyondtrust-instance.module';
import { CreateBeyondtrustInstanceCommand } from './beyondtrust-instance/commands';
import { RetrieveBeyondtrustInstancesQuery } from './beyondtrust-instance/queries';
import { BeyondtrustPraConfApiModule } from './beyondtrust-pra-conf-api/beyondtrust-pra-conf-api.module';
import { GroupPolicyJumpGroupModule } from './group-policy-jump-group/group-policy-jump-group.module';
import { GroupPolicyJumpointModule } from './group-policy-jumpoint/group-policy-jumpoint.module';
import { GroupPolicyMemberModule } from './group-policy-member/group-policy-member.module';
import { GroupPolicyTeamModule } from './group-policy-team/group-policy-team.module';
import { GroupPolicyModule } from './group-policy/group-policy.module';
import { HealthModule } from './health/health.module';
import { JumpClientModule } from './jump-client/jump-client.module';
import { JumpGroupModule } from './jump-group/jump-group.module';
import { JumpItemModule } from './jump-item/jump-item.module';
import { JumpPolicyModule } from './jump-policy/jump-policy.module';
import { JumpointModule } from './jumpoint/jumpoint.module';
import { LogModule } from './log/log.module';
import { ErrorProcessorUtility, UuidUtility } from './shared/utilities';
import { SyncModule } from './sync/sync.module';
import { TeamUserModule } from './team-user/team-user.module';
import { TeamModule } from './team/team.module';
import { UserGroupPolicyModule } from './user-group-policy/user-group-policy.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        AppConfigModule,
        TypeOrmModule.forRootAsync({
            imports: [AppConfigModule],
            useFactory: (config: AppConfigService) => config.database,
            inject: [AppConfigService],
        }),
        CqrsModule.forRoot(),
        BeyondtrustPraConfApiModule,
        HealthModule,
        BeyondtrustInstanceModule,
        BeyondtrustInstanceBackupModule,
        UserModule,
        UserGroupPolicyModule,
        TeamModule,
        JumpClientModule,
        TeamUserModule,
        GroupPolicyModule,
        GroupPolicyJumpointModule,
        GroupPolicyJumpGroupModule,
        GroupPolicyMemberModule,
        GroupPolicyTeamModule,
        JumpointModule,
        JumpGroupModule,
        JumpPolicyModule,
        JumpItemModule,
        SyncModule,
        LogModule,
    ],
    controllers: [AppController],
})
export class AppModule implements OnApplicationBootstrap {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {}

    // This is a bridge from MVP0 to MVP1.
    // In MVP1, we don't use BeyondTrust config from env file but from DB.
    // Hence, we automatically create a BeyondTrust instance in the DB from the beginning.
    // TODO remove this part once MVP1 is underway.
    public async onApplicationBootstrap() {
        try {
            const btInstances = await this.queryBus.execute<RetrieveBeyondtrustInstancesQuery, []>(
                new RetrieveBeyondtrustInstancesQuery(UuidUtility.generate(), 1, 1),
            );

            if (btInstances.length > 0) {
                return;
            }

            await this.commandBus.execute<CreateBeyondtrustInstanceCommand, void>(
                new CreateBeyondtrustInstanceCommand(
                    UuidUtility.generate(),
                    'Default BeyondTrust Instance',
                    this.appConfigService.beyondTrust.auth.clientId,
                    this.appConfigService.beyondTrust.auth.secret,
                    this.appConfigService.beyondTrust.auth.oauth2TokenUrl,
                    this.appConfigService.beyondTrust.api.baseUrl,
                    this.appConfigService.beyondTrust.backup.apiUrl,
                ),
            );
        } catch (error) {
            console.error(`Failed to initialize BeyondTrust instance: ${ErrorProcessorUtility.stringify(error)}`);
        }
    }
}
