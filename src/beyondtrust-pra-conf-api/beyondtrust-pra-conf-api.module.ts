import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HttpClientModule } from './http-client/http-client.module';
import { JumpClientModule } from './jump-client/jump-client.module';

@Module({
    imports: [AuthModule, JumpClientModule, HttpClientModule],
})
export class BeyondtrustPraConfApiModule {}
