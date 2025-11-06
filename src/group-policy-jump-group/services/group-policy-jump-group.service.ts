import { Injectable } from '@nestjs/common';
import { GroupPolicyJumpGroupEntity } from '../repositories/entities';
import { GroupPolicyJumpGroupRepositoryService } from '../repositories/services/group-policy-jump-group-repository.service';

@Injectable()
export class GroupPolicyJumpGroupService {
    constructor(private readonly groupPolicyJumpGroupRepositoryService: GroupPolicyJumpGroupRepositoryService) {}

    public async createOrUpdateByGroupPolicyIdAndJumpGroupId(
        tenantId: number,
        entity: Partial<GroupPolicyJumpGroupEntity>,
    ): Promise<void> {
        await this.groupPolicyJumpGroupRepositoryService.createOrUpdateByGroupPolicyIdAndJumpGroupId(tenantId, [
            entity,
        ]);
    }

    public async deleteByGroupPolicyIdAndJumpGroupId(
        tenantId: number,
        groupPolicyId: number,
        jumpGroupId: number,
    ): Promise<void> {
        await this.groupPolicyJumpGroupRepositoryService.deleteByGroupPolicyIdAndJumpGroupId(
            tenantId,
            groupPolicyId,
            jumpGroupId,
        );
    }
}
