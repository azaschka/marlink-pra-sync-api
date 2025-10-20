import { Injectable } from '@nestjs/common';
import { GroupPolicyEntity } from '../repositories/entities';
import { GroupPolicyRepositoryService } from '../repositories/services/group-policy-repository.service';

@Injectable()
export class GroupPolicyService {
    constructor(private readonly groupPolicyRepositoryService: GroupPolicyRepositoryService) {}

    public async createOrUpdateById(tenantId: number, entity: Partial<GroupPolicyEntity>): Promise<void> {
        await this.groupPolicyRepositoryService.createOrUpdateById(tenantId, entity);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await this.groupPolicyRepositoryService.deleteById(tenantId, id);
    }
}
