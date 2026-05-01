import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { JumpointNodeController } from './controllers/jumpoint-node.controller';
import { QueryHandlers } from './queries/handlers';
import { JumpointNodeRepositoryService } from './repositories/services/jumpoint-node-repository.service';

// NOTE: TypeOrmModule.forFeature([JumpointNodeEntity]) was intentionally removed.
//
// When it was present, JumpointNodeModule depended on TypeOrmCoreModule (the async
// DB connection), which delayed its full initialization. The CQRS ExplorerService
// (called from CqrsModule.onApplicationBootstrap) ran before JumpointNodeModule
// was registered in the NestJS module graph, so ALL query AND command handlers
// in this module were silently skipped → "No handler found" at runtime.
//
// JumpointNodeEntity is now loaded via the global entities glob in AppConfigService:
//   ${resolve(__dirname, '../..')}/**/*.entity{.ts,.js}
// JumpointNodeRepositoryService only needs DataSource (globally available from
// TypeOrmModule.forRootAsync) — no forFeature required.

@Module({
    imports: [AppConfigModule],
    controllers: [JumpointNodeController],
    providers: [...QueryHandlers, ...CommandHandlers, JumpointNodeRepositoryService],
})
export class JumpointNodeModule {}
