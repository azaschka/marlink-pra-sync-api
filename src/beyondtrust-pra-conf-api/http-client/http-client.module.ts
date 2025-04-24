import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../app-config/app-config.module';
import { AuthModule } from '../auth/auth.module';
import { HttpClientService } from './services/http-client.service';

@Module({
    imports: [HttpModule, AuthModule, AppConfigModule],
    providers: [HttpClientService],
    exports: [HttpClientService],
})
export class HttpClientModule {}
