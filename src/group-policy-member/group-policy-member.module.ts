import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { GroupPolicyMembersController } from './controllers/group-policy-members.controller';
import { GroupPolicyMemberEntity } from './repositories/entities';
import { GroupPolicyMemberRepositoryService } from './repositories/services/group-policy-member-repository.service';
import { GroupPolicyMembersSaga } from './sagas';

@Module({
    imports: [TypeOrmModule.forFeature([GroupPolicyMemberEntity]), AppConfigModule],
    controllers: [GroupPolicyMembersController],
    providers: [...CommandHandlers, GroupPolicyMemberRepositoryService, GroupPolicyMembersSaga],
})
export class GroupPolicyMemberModule {}
