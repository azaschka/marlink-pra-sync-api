import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { JumpointController } from './controllers/jumpoint.controller';
import { QueryHandlers } from './queries/handlers';
import { JumpointEntity } from './repositories/entities';
import { JumpointRepositoryService } from './repositories/services/jumpoint-repository.service';

@Module({
    imports: [TypeOrmModule.forFeature([JumpointEntity]), AppConfigModule],
    controllers: [JumpointController],
    providers: [...QueryHandlers, ...CommandHandlers, JumpointRepositoryService],
})
export class JumpointModule {}
