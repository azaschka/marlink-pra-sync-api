import { Injectable } from '@nestjs/common';
import { JumpGroupEntity } from '../repositories/entities';
import { JumpGroupRepositoryService } from '../repositories/services/jump-group-repository.service';

@Injectable()
export class JumpGroupService {
    constructor(private readonly jumpGroupRepositoryService: JumpGroupRepositoryService) {}

    public async createOrUpdateById(tenantId: number, entity: Partial<JumpGroupEntity>): Promise<void> {
        await this.jumpGroupRepositoryService.createOrUpdateById(tenantId, entity);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await this.jumpGroupRepositoryService.deleteById(tenantId, id);
    }
}
