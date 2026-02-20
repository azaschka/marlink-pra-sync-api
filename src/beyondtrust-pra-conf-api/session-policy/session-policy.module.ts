import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../app-config/app-config.module';
import { HttpClientModule } from '../http-client/http-client.module';
import { QueryHandlers } from './queries/handlers';

@Module({
    imports: [AppConfigModule, HttpClientModule],
    providers: [...QueryHandlers],
})
export class SessionPolicyModule {}
