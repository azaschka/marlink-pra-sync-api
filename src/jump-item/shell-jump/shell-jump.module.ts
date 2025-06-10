import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { ShellJumpController } from './controllers/shell-jump.controller';
import { QueryHandlers } from './queries/handlers';
import { ShellJumpEntity } from './repositories/entities';
import { ShellJumpRepositoryService } from './repositories/services/shell-jump-repository.service';

@Module({
    imports: [TypeOrmModule.forFeature([ShellJumpEntity]), AppConfigModule],
    controllers: [ShellJumpController],
    providers: [...QueryHandlers, ...CommandHandlers, ShellJumpRepositoryService],
})
export class ShellJumpModule {}
