import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { GroupPolicyTeamsController } from './controllers/group-policy-teams.controller';
import { GroupPolicyTeamEntity } from './repositories/entities';
import { GroupPolicyTeamRepositoryService } from './repositories/services/group-policy-team-repository.service';
import { GroupPolicyTeamsSaga } from './sagas';

@Module({
    imports: [TypeOrmModule.forFeature([GroupPolicyTeamEntity]), AppConfigModule],
    controllers: [GroupPolicyTeamsController],
    providers: [...CommandHandlers, GroupPolicyTeamRepositoryService, GroupPolicyTeamsSaga],
})
export class GroupPolicyTeamModule {}
