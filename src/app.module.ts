import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { BeyondtrustPraConfApiModule } from './beyondtrust-pra-conf-api/beyondtrust-pra-conf-api.module';
import { GroupPolicyModule } from './group-policy/group-policy.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [CqrsModule.forRoot(), BeyondtrustPraConfApiModule, UserModule, GroupPolicyModule],
    controllers: [AppController],
})
export class AppModule {}
