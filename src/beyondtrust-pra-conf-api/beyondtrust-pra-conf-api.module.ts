import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HttpClientModule } from './http-client/http-client.module';
import { JumpClientModule } from './jump-client/jump-client.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [AuthModule, JumpClientModule, HttpClientModule, UserModule],
})
export class BeyondtrustPraConfApiModule {}
