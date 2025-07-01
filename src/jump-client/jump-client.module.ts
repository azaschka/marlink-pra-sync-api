import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { JumpClientInstallerController } from './controllers/jump-client-installer.controller';
import { JumpClientController } from './controllers/jump-client.controller';
import { QueryHandlers } from './queries/handlers';
import { JumpClientEntity, JumpClientInstallerEntity } from './repositories/entities';
import { JumpClientInstallerRepositoryService } from './repositories/services/jump-client-installer-repository.service';
import { JumpClientRepositoryService } from './repositories/services/jump-client-repository.service';

@Module({
    imports: [TypeOrmModule.forFeature([JumpClientEntity, JumpClientInstallerEntity]), AppConfigModule],
    controllers: [JumpClientController, JumpClientInstallerController],
    providers: [
        ...QueryHandlers,
        ...CommandHandlers,
        JumpClientRepositoryService,
        JumpClientInstallerRepositoryService,
    ],
})
export class JumpClientModule {}
