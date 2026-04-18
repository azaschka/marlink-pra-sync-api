import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { AppConfigModule } from '../../app-config/app-config.module';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { AuthModule } from '../auth/auth.module';
import { HttpClientService } from './services/http-client.service';

@Module({
    imports: [
        HttpModule.registerAsync({
            imports: [AppConfigModule],
            inject: [AppConfigService],
            useFactory: (appConfigService: AppConfigService) => ({
                timeout: 3 * 60 * 1000, // 3 minutes
                maxRedirects: 5,
                proxy: false,
                httpAgent: appConfigService.proxy.http ? new HttpProxyAgent(appConfigService.proxy.http) : undefined,
                httpsAgent: appConfigService.proxy.https
                    ? new HttpsProxyAgent(appConfigService.proxy.https)
                    : undefined,
            }),
        }),
        AuthModule,
        AppConfigModule,
    ],
    providers: [HttpClientService],
    exports: [HttpClientService],
})
export class HttpClientModule {}
