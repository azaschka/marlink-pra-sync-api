import { Module } from '@nestjs/common';
import { CommandHandlers } from './commands/handlers';
import { UserController } from './controllers/user.controller';
import { QueryHandlers } from './queries/handlers';

@Module({
    controllers: [UserController],
    providers: [...QueryHandlers, ...CommandHandlers],
})
export class UserModule {}
