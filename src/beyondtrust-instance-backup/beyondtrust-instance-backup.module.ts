import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { BeyondtrustInstanceBackupController } from './controllers/beyondtrust-instance-backup.controller';
import { QueryHandlers } from './queries/handlers';
import { BeyondtrustInstanceBackupEntity } from './repositories/entities';
import { BeyondtrustInstanceBackupRepositoryService } from './repositories/services/beyondtrust-instance-backup-repository.service';

@Module({
    imports: [TypeOrmModule.forFeature([BeyondtrustInstanceBackupEntity]), AppConfigModule],
    controllers: [BeyondtrustInstanceBackupController],
    providers: [...QueryHandlers, ...CommandHandlers, BeyondtrustInstanceBackupRepositoryService],
})
export class BeyondtrustInstanceBackupModule {}
