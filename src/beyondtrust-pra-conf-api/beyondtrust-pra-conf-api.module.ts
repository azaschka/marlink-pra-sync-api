import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BackupModule } from './backup/backup.module';
import { GroupPolicyModule } from './group-policy/group-policy.module';
import { HttpClientModule } from './http-client/http-client.module';
import { JumpClientModule } from './jump-client/jump-client.module';
import { JumpGroupModule } from './jump-group/jump-group.module';
import { JumpItemModule } from './jump-item/jump-item.module';
import { JumpPolicyModule } from './jump-policy/jump-policy.module';
import { JumpointModule } from './jumpoint/jumpoint.module';
import { SessionPolicyModule } from './session-policy/session-policy.module';
import { TeamModule } from './team/team.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        BackupModule,
        AuthModule,
        JumpClientModule,
        HttpClientModule,
        UserModule,
        GroupPolicyModule,
        TeamModule,
        JumpGroupModule,
        JumpPolicyModule,
        JumpointModule,
        JumpItemModule,
        SessionPolicyModule,
    ],
})
export class BeyondtrustPraConfApiModule {}
