import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../../app-config/app-config.module';
import { CommandHandlers } from './commands/handlers';
import { ProtocolTunnelJumpController } from './controllers/protocol-tunnel-jump.controller';
import { QueryHandlers } from './queries/handlers';
import { ProtocolTunnelJumpEntity } from './repositories/entities';
import { ProtocolTunnelJumpRepositoryService } from './repositories/services/protocol-tunnel-jump-repository.service';

@Module({
    imports: [TypeOrmModule.forFeature([ProtocolTunnelJumpEntity]), AppConfigModule],
    controllers: [ProtocolTunnelJumpController],
    providers: [...QueryHandlers, ...CommandHandlers, ProtocolTunnelJumpRepositoryService],
})
export class ProtocolTunnelJumpModule {}
