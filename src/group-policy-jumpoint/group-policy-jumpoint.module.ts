import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { GroupPolicyJumpointController } from './controllers/group-policy-jumpoint.controller';
import { QueryHandlers } from './queries/handlers';
import { GroupPolicyJumpointEntity } from './repositories/entities';
import { GroupPolicyJumpointRepositoryService } from './repositories/services/group-policy-jumpoint-repository.service';
import { GroupPolicyJumpointsSaga } from './sagas';

@Module({
    imports: [TypeOrmModule.forFeature([GroupPolicyJumpointEntity]), AppConfigModule],
    controllers: [GroupPolicyJumpointController],
    providers: [...CommandHandlers, ...QueryHandlers, GroupPolicyJumpointRepositoryService, GroupPolicyJumpointsSaga],
})
export class GroupPolicyJumpointModule {}
