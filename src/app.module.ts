import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BeyondtrustPraConfApiModule } from './beyondtrust-pra-conf-api/beyondtrust-pra-conf-api.module';

@Module({
    imports: [BeyondtrustPraConfApiModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
