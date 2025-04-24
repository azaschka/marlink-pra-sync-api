import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../app-config/app-config.module';
import { AuthTokenService } from './services/auth-token.service';

@Module({
    imports: [AppConfigModule, HttpModule],
    providers: [AuthTokenService],
    exports: [AuthTokenService],
})
export class AuthModule {}
