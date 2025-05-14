import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandHandlers } from './commands/handlers';
import { UserController } from './controllers/user.controller';
import { QueryHandlers } from './queries/handlers';
import { UserEntity } from './repositories/entities';
import { UserRepositoryService } from './repositories/services/user-repository.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [UserController],
    providers: [...QueryHandlers, ...CommandHandlers, UserRepositoryService],
})
export class UserModule {}
