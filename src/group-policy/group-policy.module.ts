import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandHandlers } from './commands/handlers';
import { GroupPolicyController } from './controllers/group-policy.controller';
import { QueryHandlers } from './queries/handlers';
import { GroupPolicyEntity } from './repositories/entities';

@Module({
    imports: [TypeOrmModule.forFeature([GroupPolicyEntity])],
    controllers: [GroupPolicyController],
    providers: [...QueryHandlers, ...CommandHandlers],
})
export class GroupPolicyModule {}
