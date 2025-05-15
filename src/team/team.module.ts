import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandHandlers } from './commands/handlers';
import { TeamController } from './controllers/team.controller';
import { QueryHandlers } from './queries/handlers';
import { TeamEntity } from './repositories/entities';
import { TeamRepositoryService } from './repositories/services/team-repository.service';

@Module({
    imports: [TypeOrmModule.forFeature([TeamEntity])],
    controllers: [TeamController],
    providers: [...QueryHandlers, ...CommandHandlers, TeamRepositoryService],
})
export class TeamModule {}
