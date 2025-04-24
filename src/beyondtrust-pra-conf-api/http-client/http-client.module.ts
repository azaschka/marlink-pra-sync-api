import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HttpClientService } from './services/http-client.service';

@Module({
    imports: [HttpModule, AuthModule],
    providers: [HttpClientService],
    exports: [HttpClientService],
})
export class HttpClientModule {}
