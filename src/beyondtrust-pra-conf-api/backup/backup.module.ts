import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../app-config/app-config.module';
import { HttpClientModule } from '../http-client/http-client.module';
import { CommandHandlers } from './commands/handlers';

@Module({
    imports: [AppConfigModule, HttpClientModule],
    providers: [...CommandHandlers],
})
export class BackupModule {}
