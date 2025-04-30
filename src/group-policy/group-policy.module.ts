import { Module } from '@nestjs/common';
import { GroupPolicyController } from './controllers/group-policy.controller';
import { QueryHandlers } from './queries/handlers';

@Module({
    controllers: [GroupPolicyController],
    providers: [...QueryHandlers],
})
export class GroupPolicyModule {}
