import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { JumpClientModule } from './jump-client/jump-client.module';

@Module({
    imports: [AuthModule, JumpClientModule],
})
export class BeyondtrustPraConfApiModule {}
