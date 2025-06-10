import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { RemoteVncController } from './controllers/remote-vnc.controller';
import { QueryHandlers } from './queries/handlers';
import { RemoteVncEntity } from './repositories/entities';
import { RemoteVncRepositoryService } from './repositories/services/remote-vnc-repository.service';

@Module({
    imports: [TypeOrmModule.forFeature([RemoteVncEntity]), AppConfigModule],
    controllers: [RemoteVncController],
    providers: [...QueryHandlers, ...CommandHandlers, RemoteVncRepositoryService],
})
export class RemoteVncModule {}
