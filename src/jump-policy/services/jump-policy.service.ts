import { Injectable } from '@nestjs/common';
import { JumpPolicyEntity } from '../repositories/entities';
import { JumpPolicyRepositoryService } from '../repositories/services/jump-policy-repository.service';

@Injectable()
export class JumpPolicyService {
    constructor(private readonly jumpPolicyRepositoryService: JumpPolicyRepositoryService) {}

    public async createOrUpdateById(tenantId: number, entity: Partial<JumpPolicyEntity>): Promise<void> {
        await this.jumpPolicyRepositoryService.createOrUpdateById(tenantId, entity);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await this.jumpPolicyRepositoryService.deleteById(tenantId, id);
    }
}
