import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { RemoteRdpController } from './controllers/remote-rdp.controller';
import { QueryHandlers } from './queries/handlers';
import { RemoteRdpEntity } from './repositories/entities';
import { RemoteRdpRepositoryService } from './repositories/services/remote-rdp-repository.service';

@Module({
    imports: [TypeOrmModule.forFeature([RemoteRdpEntity]), AppConfigModule],
    controllers: [RemoteRdpController],
    providers: [...QueryHandlers, ...CommandHandlers, RemoteRdpRepositoryService],
})
export class RemoteRdpModule {}
