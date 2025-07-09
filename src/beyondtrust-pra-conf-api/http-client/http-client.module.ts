/* eslint-disable @typescript-eslint/no-unsafe-call */
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
            useFactory: (config: AppConfigService) => ({
                timeout: 10000,
                maxRedirects: 5,
                proxy: false,
                httpAgent: config.proxies.http ? new HttpProxyAgent(config.proxies.http) : undefined,
                httpsAgent: config.proxies.https ? new HttpsProxyAgent(config.proxies.https) : undefined,
            }),
        }),
        AuthModule,
        AppConfigModule,
    ],
    providers: [HttpClientService],
    exports: [HttpClientService],
})
export class HttpClientModule {}
