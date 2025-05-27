import { Module } from '@nestjs/common';
import { SyncController } from './controllers/sync.controller';

@Module({
    controllers: [SyncController],
})
export class SyncModule {}
