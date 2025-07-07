import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { GroupPolicyJumpGroupController } from './controllers/group-policy-jump-group.controller';
import { QueryHandlers } from './queries/handlers';
import { GroupPolicyJumpGroupEntity } from './repositories/entities';
import { GroupPolicyJumpGroupRepositoryService } from './repositories/services/group-policy-jump-group-repository.service';
import { GroupPolicyJumpGroupsSaga } from './sagas';

@Module({
    imports: [TypeOrmModule.forFeature([GroupPolicyJumpGroupEntity]), AppConfigModule],
    controllers: [GroupPolicyJumpGroupController],
    providers: [...CommandHandlers, ...QueryHandlers, GroupPolicyJumpGroupRepositoryService, GroupPolicyJumpGroupsSaga],
})
export class GroupPolicyJumpGroupModule {}
