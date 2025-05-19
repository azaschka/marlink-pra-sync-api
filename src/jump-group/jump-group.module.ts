import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandHandlers } from './commands/handlers';
import { JumpGroupController } from './controllers/jump-group.controller';
import { QueryHandlers } from './queries/handlers';
import { JumpGroupEntity } from './repositories/entities';
import { JumpGroupRepositoryService } from './repositories/services/jump-group-repository.service';

@Module({
    imports: [TypeOrmModule.forFeature([JumpGroupEntity])],
    controllers: [JumpGroupController],
    providers: [...QueryHandlers, ...CommandHandlers, JumpGroupRepositoryService],
})
export class JumpGroupModule {}
