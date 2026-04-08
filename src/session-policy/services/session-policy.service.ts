import { Injectable } from '@nestjs/common';
import { SessionPolicyEntity } from '../repositories/entities';
import { SessionPolicyRepositoryService } from '../repositories/services/session-policy-repository.service';

@Injectable()
export class SessionPolicyService {
    constructor(private readonly sessionPolicyRepositoryService: SessionPolicyRepositoryService) {}

    public async createOrUpdateById(tenantId: number, entity: Partial<SessionPolicyEntity>): Promise<void> {
        await this.sessionPolicyRepositoryService.createOrUpdateById(tenantId, entity);
    }

    public async deleteById(tenantId: number, id: number): Promise<void> {
        return await this.sessionPolicyRepositoryService.deleteById(tenantId, id);
    }
}
