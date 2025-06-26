import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandHandlers } from './commands/handlers';
import { BeyondtrustInstanceController } from './controllers/beyondtrust-instance.controller';
import { QueryHandlers } from './queries/handlers';
import { BeyondtrustInstanceEntity } from './repositories/entities';
import { BeyondtrustInstanceRepositoryService } from './repositories/services/beyondtrust-instance-repository.service';

@Module({
    imports: [TypeOrmModule.forFeature([BeyondtrustInstanceEntity])],
    controllers: [BeyondtrustInstanceController],
    providers: [...QueryHandlers, ...CommandHandlers, BeyondtrustInstanceRepositoryService],
})
export class BeyondtrustInstanceModule {}
