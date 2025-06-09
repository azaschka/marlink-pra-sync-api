import { Module } from '@nestjs/common';
import { RemoteRdpModule } from './remote-rdp/remote-rdp.module';

@Module({
    imports: [RemoteRdpModule],
})
export class JumpItemModule {}
