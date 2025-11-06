import { Injectable } from '@nestjs/common';
import { RemoteVncEntity } from '../repositories/entities';
import { RemoteVncRepositoryService } from '../repositories/services/remote-vnc-repository.service';

@Injectable()
export class RemoteVncService {
    constructor(private readonly remoteVncRepositoryService: RemoteVncRepositoryService) {}

    public async createOrUpdateById(tenantId: number, entity: Partial<RemoteVncEntity>): Promise<void> {
        await this.remoteVncRepositoryService.createOrUpdateById(tenantId, entity);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await this.remoteVncRepositoryService.deleteById(tenantId, id);
    }
}
