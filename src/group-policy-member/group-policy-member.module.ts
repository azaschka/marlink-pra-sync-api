import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { GroupPolicyMemberController } from './controllers/group-policy-member.controller';
import { QueryHandlers } from './queries/handlers';
import { GroupPolicyMemberEntity } from './repositories/entities';
import { GroupPolicyMemberRepositoryService } from './repositories/services/group-policy-member-repository.service';
import { GroupPolicyMembersSaga } from './sagas';

@Module({
    imports: [TypeOrmModule.forFeature([GroupPolicyMemberEntity]), AppConfigModule],
    controllers: [GroupPolicyMemberController],
    providers: [...CommandHandlers, ...QueryHandlers, GroupPolicyMemberRepositoryService, GroupPolicyMembersSaga],
})
export class GroupPolicyMemberModule {}
