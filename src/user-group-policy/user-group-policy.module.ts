import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { UserGroupPoliciesController } from './controllers/user-group-policies.controller';
import { UserGroupPolicyEntity } from './repositories/entities';
import { UserGroupPolicyRepositoryService } from './repositories/services/user-group-policy-repository.service';
import { UserGroupPoliciesSaga } from './sagas';

@Module({
    imports: [TypeOrmModule.forFeature([UserGroupPolicyEntity]), AppConfigModule],
    controllers: [UserGroupPoliciesController],
    providers: [...CommandHandlers, UserGroupPolicyRepositoryService, UserGroupPoliciesSaga],
})
export class UserGroupPolicyModule {}
