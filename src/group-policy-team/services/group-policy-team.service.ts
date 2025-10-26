import { Injectable } from '@nestjs/common';
import { GroupPolicyTeamEntity } from '../repositories/entities';
import { GroupPolicyTeamRepositoryService } from '../repositories/services/group-policy-team-repository.service';

@Injectable()
export class GroupPolicyTeamService {
    constructor(private readonly groupPolicyTeamRepositoryService: GroupPolicyTeamRepositoryService) {}

    public async createOrUpdateByGroupPolicyIdAndTeamId(
        tenantId: number,
        entity: Partial<GroupPolicyTeamEntity>,
    ): Promise<void> {
        await this.groupPolicyTeamRepositoryService.createOrUpdateByGroupPolicyIdAndTeamId(tenantId, [entity]);
    }

    public async deleteByGroupPolicyIdAndTeamId(
        tenantId: number,
        groupPolicyId: number,
        teamId: number,
    ): Promise<void> {
        await this.groupPolicyTeamRepositoryService.deleteByGroupPolicyIdAndTeamId(tenantId, groupPolicyId, teamId);
    }
}
