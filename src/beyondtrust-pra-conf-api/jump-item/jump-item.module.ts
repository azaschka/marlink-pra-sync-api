import { Module } from '@nestjs/common';
import { ProtocolTunnelJumpModule } from './protocol-tunnel-jump/protocol-tunnel-jump.module';
import { RemoteRdpModule } from './remote-rdp/remote-rdp.module';
import { RemoteVncModule } from './remote-vnc/remote-vnc.module';
import { ShellJumpModule } from './shell-jump/shell-jump.module';
import { WebJumpModule } from './web-jump/web-jump.module';

@Module({
    imports: [RemoteRdpModule, ShellJumpModule, WebJumpModule, RemoteVncModule, ProtocolTunnelJumpModule],
})
export class JumpItemModule {}
