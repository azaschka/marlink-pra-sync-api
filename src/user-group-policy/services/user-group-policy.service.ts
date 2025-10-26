import { Injectable } from '@nestjs/common';
import { UserGroupPolicyEntity } from '../repositories/entities';
import { UserGroupPolicyRepositoryService } from '../repositories/services/user-group-policy-repository.service';

@Injectable()
export class UserGroupPolicyService {
    constructor(private readonly userGroupPolicyRepositoryService: UserGroupPolicyRepositoryService) {}

    public async createOrUpdateByUserIdAndGroupPolicyId(
        tenantId: number,
        entity: Partial<UserGroupPolicyEntity>,
    ): Promise<void> {
        await this.userGroupPolicyRepositoryService.createOrUpdateByUserIdAndGroupPolicyId(tenantId, [entity]);
    }

    public async deleteByUserIdAndGroupPolicyId(
        tenantId: number,
        userId: number,
        groupPolicyId: number,
    ): Promise<void> {
        await this.userGroupPolicyRepositoryService.deleteByUserIdAndGroupPolicyId(tenantId, userId, groupPolicyId);
    }
}
