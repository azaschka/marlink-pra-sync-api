import { Injectable } from '@nestjs/common';
import { GroupPolicyJumpointEntity } from '../repositories/entities';
import { GroupPolicyJumpointRepositoryService } from '../repositories/services/group-policy-jumpoint-repository.service';

@Injectable()
export class GroupPolicyJumpointService {
    constructor(private readonly groupPolicyJumpointRepositoryService: GroupPolicyJumpointRepositoryService) {}

    public async createOrUpdateByGroupPolicyIdAndJumpointId(
        tenantId: number,
        entity: Partial<GroupPolicyJumpointEntity>,
    ): Promise<void> {
        await this.groupPolicyJumpointRepositoryService.createOrUpdateByGroupPolicyIdAndJumpointId(tenantId, [entity]);
    }

    public async deleteByGroupPolicyIdAndJumpointId(
        tenantId: number,
        groupPolicyId: number,
        jumpointId: number,
    ): Promise<void> {
        await this.groupPolicyJumpointRepositoryService.deleteByGroupPolicyIdAndJumpointId(
            tenantId,
            groupPolicyId,
            jumpointId,
        );
    }
}
