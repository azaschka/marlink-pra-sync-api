import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { TeamUsersController } from './controllers/team-users.controller';
import { TeamUserEntity } from './repositories/entities';
import { TeamUserRepositoryService } from './repositories/services/team-user-repository.service';
import { TeamUsersSaga } from './sagas';

@Module({
    imports: [TypeOrmModule.forFeature([TeamUserEntity]), AppConfigModule],
    controllers: [TeamUsersController],
    providers: [...CommandHandlers, TeamUserRepositoryService, TeamUsersSaga],
})
export class TeamUserModule {}
