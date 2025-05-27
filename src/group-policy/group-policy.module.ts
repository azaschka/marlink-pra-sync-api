import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { GroupPolicyController } from './controllers/group-policy.controller';
import { QueryHandlers } from './queries/handlers';
import { GroupPolicyEntity } from './repositories/entities';
import { GroupPolicyRepositoryService } from './repositories/services/group-policy-repository.service';

@Module({
    imports: [TypeOrmModule.forFeature([GroupPolicyEntity]), AppConfigModule],
    controllers: [GroupPolicyController],
    providers: [...QueryHandlers, ...CommandHandlers, GroupPolicyRepositoryService],
})
export class GroupPolicyModule {}
