import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { JumpointNodeController } from './controllers/jumpoint-node.controller';
import { QueryHandlers } from './queries/handlers';
import { JumpointNodeEntity } from './repositories/entities';
import { JumpointNodeRepositoryService } from './repositories/services/jumpoint-node-repository.service';

@Module({
    imports: [AppConfigModule, TypeOrmModule.forFeature([JumpointNodeEntity])],
    controllers: [JumpointNodeController],
    providers: [...QueryHandlers, ...CommandHandlers, JumpointNodeRepositoryService],
})
export class JumpointNodeModule {}
