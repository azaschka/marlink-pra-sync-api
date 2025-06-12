import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { GroupPolicyJumpointsController } from './controllers/group-policy-jumpoints.controller';
import { GroupPolicyJumpointEntity } from './repositories/entities';
import { GroupPolicyJumpointRepositoryService } from './repositories/services/group-policy-jumpoint-repository.service';
import { GroupPolicyJumpointsSaga } from './sagas';

@Module({
    imports: [TypeOrmModule.forFeature([GroupPolicyJumpointEntity]), AppConfigModule],
    controllers: [GroupPolicyJumpointsController],
    providers: [...CommandHandlers, GroupPolicyJumpointRepositoryService, GroupPolicyJumpointsSaga],
})
export class GroupPolicyJumpointModule {}
