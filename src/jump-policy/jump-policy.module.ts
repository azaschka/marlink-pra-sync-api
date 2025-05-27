import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { JumpPolicyController } from './controllers/jump-policy.controller';
import { QueryHandlers } from './queries/handlers';
import { JumpPolicyEntity } from './repositories/entities';
import { JumpPolicyRepositoryService } from './repositories/services/jump-policy-repository.service';

@Module({
    imports: [TypeOrmModule.forFeature([JumpPolicyEntity]), AppConfigModule],
    controllers: [JumpPolicyController],
    providers: [...QueryHandlers, ...CommandHandlers, JumpPolicyRepositoryService],
})
export class JumpPolicyModule {}
