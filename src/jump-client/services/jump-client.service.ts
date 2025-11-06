import { Injectable } from '@nestjs/common';
import { JumpClientEntity } from '../repositories/entities';
import { JumpClientRepositoryService } from '../repositories/services/jump-client-repository.service';

@Injectable()
export class JumpClientService {
    constructor(private readonly jumpClientRepositoryService: JumpClientRepositoryService) {}

    public async createOrUpdateById(tenantId: number, entity: Partial<JumpClientEntity>): Promise<void> {
        await this.jumpClientRepositoryService.createOrUpdateById(tenantId, entity);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await this.jumpClientRepositoryService.deleteById(tenantId, id);
    }
}
