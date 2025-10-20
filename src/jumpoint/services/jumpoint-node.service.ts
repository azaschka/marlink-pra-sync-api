import { Injectable } from '@nestjs/common';
import { JumpointNodeEntity } from '../repositories/entities';
import { JumpointNodeRepositoryService } from '../repositories/services/jumpoint-node-repository.service';

@Injectable()
export class JumpointNodeService {
    constructor(private readonly jumpointNodeRepositoryService: JumpointNodeRepositoryService) {}

    public async createOrUpdateById(tenantId: number, entity: Partial<JumpointNodeEntity>): Promise<void> {
        await this.jumpointNodeRepositoryService.createOrUpdateById(tenantId, entity);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await this.jumpointNodeRepositoryService.deleteById(tenantId, id);
    }
}
