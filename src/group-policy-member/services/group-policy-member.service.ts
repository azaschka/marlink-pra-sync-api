import { Injectable } from '@nestjs/common';
import { GroupPolicyMemberEntity } from '../repositories/entities';
import { GroupPolicyMemberRepositoryService } from '../repositories/services/group-policy-member-repository.service';

@Injectable()
export class GroupPolicyMemberService {
    constructor(private readonly groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService) {}

    public async createOrUpdateByGroupPolicyIdAndMemberId(
        tenantId: number,
        entity: Partial<GroupPolicyMemberEntity>,
    ): Promise<void> {
        await this.groupPolicyMemberRepositoryService.createOrUpdateByGroupPolicyIdAndMemberId(tenantId, [entity]);
    }

    public async deleteByGroupPolicyIdAndMemberId(
        tenantId: number,
        groupPolicyId: number,
        memberId: number,
    ): Promise<void> {
        await this.groupPolicyMemberRepositoryService.deleteByGroupPolicyIdAndMemberId(
            tenantId,
            groupPolicyId,
            memberId,
        );
    }
}
