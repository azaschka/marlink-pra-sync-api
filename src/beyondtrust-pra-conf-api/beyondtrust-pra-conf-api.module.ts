import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GroupPolicyModule } from './group-policy/group-policy.module';
import { HttpClientModule } from './http-client/http-client.module';
import { JumpClientModule } from './jump-client/jump-client.module';
import { JumpGroupModule } from './jump-group/jump-group.module';
import { JumpPolicyModule } from './jump-policy/jump-policy.module';
import { JumpointModule } from './jumpoint/jumpoint.module';
import { TeamModule } from './team/team.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        AuthModule,
        JumpClientModule,
        HttpClientModule,
        UserModule,
        GroupPolicyModule,
        TeamModule,
        JumpGroupModule,
        JumpPolicyModule,
        JumpointModule,
    ],
})
export class BeyondtrustPraConfApiModule {}
