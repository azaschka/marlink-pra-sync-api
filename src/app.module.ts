import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BeyondtrustPraConfApiModule } from './beyondtrust-pra-conf-api/beyondtrust-pra-conf-api.module';

@Module({
    imports: [CqrsModule.forRoot(), BeyondtrustPraConfApiModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
