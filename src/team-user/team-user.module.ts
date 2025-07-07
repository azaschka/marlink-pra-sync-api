import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { TeamUserController } from './controllers/team-user.controller';
import { QueryHandlers } from './queries/handlers';
import { TeamUserEntity } from './repositories/entities';
import { TeamUserRepositoryService } from './repositories/services/team-user-repository.service';
import { TeamUsersSaga } from './sagas';

@Module({
    imports: [TypeOrmModule.forFeature([TeamUserEntity]), AppConfigModule],
    controllers: [TeamUserController],
    providers: [...CommandHandlers, ...QueryHandlers, TeamUserRepositoryService, TeamUsersSaga],
})
export class TeamUserModule {}
