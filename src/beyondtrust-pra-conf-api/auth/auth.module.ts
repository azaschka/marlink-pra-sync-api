import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';

@Module({
    imports: [AppConfigModule, HttpModule],
    providers: [...CommandHandlers],
})
export class AuthModule {}
