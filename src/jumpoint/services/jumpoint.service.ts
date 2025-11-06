import { Injectable } from '@nestjs/common';
import { JumpointEntity } from '../repositories/entities';
import { JumpointRepositoryService } from '../repositories/services/jumpoint-repository.service';

@Injectable()
export class JumpointService {
    constructor(private readonly jumpointRepositoryService: JumpointRepositoryService) {}

    public async createOrUpdateById(tenantId: number, entity: Partial<JumpointEntity>): Promise<void> {
        await this.jumpointRepositoryService.createOrUpdateById(tenantId, entity);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await this.jumpointRepositoryService.deleteById(tenantId, id);
    }
}
