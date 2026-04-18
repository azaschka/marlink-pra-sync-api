import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HttpClientModule } from './http-client/http-client.module';
import { NodesModule } from './nodes/nodes.module';

@Module({ imports: [AuthModule, HttpClientModule, NodesModule] })
export class ServiceManagerApiModule {}
