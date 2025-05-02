import { Module } from '@nestjs/common';
import { CommandHandlers } from './commands/handlers';
import { GroupPolicyController } from './controllers/group-policy.controller';
import { QueryHandlers } from './queries/handlers';

@Module({
    controllers: [GroupPolicyController],
    providers: [...QueryHandlers, ...CommandHandlers],
})
export class GroupPolicyModule {}
