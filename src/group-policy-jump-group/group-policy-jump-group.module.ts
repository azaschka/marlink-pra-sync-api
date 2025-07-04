import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { GroupPolicyJumpGroupsController } from './controllers/group-policy-jump-groups.controller';
import { GroupPolicyJumpGroupEntity } from './repositories/entities';
import { GroupPolicyJumpGroupRepositoryService } from './repositories/services/group-policy-jump-group-repository.service';
import { GroupPolicyJumpGroupsSaga } from './sagas';

@Module({
    imports: [TypeOrmModule.forFeature([GroupPolicyJumpGroupEntity]), AppConfigModule],
    controllers: [GroupPolicyJumpGroupsController],
    providers: [...CommandHandlers, GroupPolicyJumpGroupRepositoryService, GroupPolicyJumpGroupsSaga],
})
export class GroupPolicyJumpGroupModule {}
