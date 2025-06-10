import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { WebJumpController } from './controllers/web-jump.controller';
import { QueryHandlers } from './queries/handlers';
import { WebJumpEntity } from './repositories/entities';
import { WebJumpRepositoryService } from './repositories/services/web-jump-repository.service';

@Module({
    imports: [TypeOrmModule.forFeature([WebJumpEntity]), AppConfigModule],
    controllers: [WebJumpController],
    providers: [...QueryHandlers, ...CommandHandlers, WebJumpRepositoryService],
})
export class WebJumpModule {}
