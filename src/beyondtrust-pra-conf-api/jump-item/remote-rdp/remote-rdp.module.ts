import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../../app-config/app-config.module';
import { HttpClientModule } from '../../http-client/http-client.module';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';

@Module({
    imports: [AppConfigModule, HttpClientModule],
    providers: [...CommandHandlers, ...QueryHandlers],
})
export class RemoteRdpModule {}
