import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { JumpointController } from './controllers/jumpoint.controller';
import { QueryHandlers } from './queries/handlers';
import { JumpointEntity, JumpointNodeEntity } from './repositories/entities';
import { JumpointNodeRepositoryService } from './repositories/services/jumpoint-node-repository.service';
import { JumpointRepositoryService } from './repositories/services/jumpoint-repository.service';
import { JumpointNodesSaga } from './sagas';

@Module({
    imports: [TypeOrmModule.forFeature([JumpointEntity, JumpointNodeEntity]), AppConfigModule],
    controllers: [JumpointController],
    providers: [
        ...QueryHandlers,
        ...CommandHandlers,
        JumpointRepositoryService,
        JumpointNodeRepositoryService,
        JumpointNodesSaga,
    ],
})
export class JumpointModule {}
