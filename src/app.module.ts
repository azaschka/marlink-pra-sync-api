import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from './app-config/app-config.module';
import { AppConfigService } from './app-config/services/app-config.service';
import { AppController } from './app.controller';
import { BeyondtrustPraConfApiModule } from './beyondtrust-pra-conf-api/beyondtrust-pra-conf-api.module';
import { GroupPolicyModule } from './group-policy/group-policy.module';
import { JumpGroupModule } from './jump-group/jump-group.module';
import { JumpPolicyModule } from './jump-policy/jump-policy.module';
import { SyncModule } from './sync/sync.module';
import { TeamModule } from './team/team.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [AppConfigModule],
            useFactory: (config: AppConfigService) => config.database,
            inject: [AppConfigService],
        }),
        CqrsModule.forRoot(),
        BeyondtrustPraConfApiModule,
        UserModule,
        GroupPolicyModule,
        TeamModule,
        JumpGroupModule,
        JumpPolicyModule,
        SyncModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
