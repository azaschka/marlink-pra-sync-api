import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { GroupPolicyTeamController } from './controllers/group-policy-team.controller';
import { QueryHandlers } from './queries/handlers';
import { GroupPolicyTeamEntity } from './repositories/entities';
import { GroupPolicyTeamRepositoryService } from './repositories/services/group-policy-team-repository.service';
import { GroupPolicyTeamsSaga } from './sagas';

@Module({
    imports: [TypeOrmModule.forFeature([GroupPolicyTeamEntity]), AppConfigModule],
    controllers: [GroupPolicyTeamController],
    providers: [...CommandHandlers, ...QueryHandlers, GroupPolicyTeamRepositoryService, GroupPolicyTeamsSaga],
})
export class GroupPolicyTeamModule {}
