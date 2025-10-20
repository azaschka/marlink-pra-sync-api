import { Injectable } from '@nestjs/common';
import { RemoteRdpEntity } from '../repositories/entities';
import { RemoteRdpRepositoryService } from '../repositories/services/remote-rdp-repository.service';

@Injectable()
export class RemoteRdpService {
    constructor(private readonly remoteRdpRepositoryService: RemoteRdpRepositoryService) {}

    public async createOrUpdateById(tenantId: number, entity: Partial<RemoteRdpEntity>): Promise<void> {
        await this.remoteRdpRepositoryService.createOrUpdateById(tenantId, entity);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await this.remoteRdpRepositoryService.deleteById(tenantId, id);
    }
}
