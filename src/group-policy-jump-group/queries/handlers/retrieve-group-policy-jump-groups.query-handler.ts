import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupPolicyJumpGroup } from '../../models';
import { GroupPolicyJumpGroupEntity } from '../../repositories/entities';
import { GroupPolicyJumpGroupRepositoryService } from '../../repositories/services/group-policy-jump-group-repository.service';
import { RetrieveGroupPolicyJumpGroupsQuery } from '../retrieve-group-policy-jump-groups.query';

@QueryHandler(RetrieveGroupPolicyJumpGroupsQuery)
export class RetrieveGroupPolicyJumpGroupsQueryHandler implements IQueryHandler<RetrieveGroupPolicyJumpGroupsQuery> {
    constructor(private readonly groupPolicyJumpGroupRepositoryService: GroupPolicyJumpGroupRepositoryService) {}

    public async execute(query: RetrieveGroupPolicyJumpGroupsQuery): Promise<GroupPolicyJumpGroup[]> {
        const groupPolicyJumpGroupFindByQuery = <GroupPolicyJumpGroupEntity>{};
        groupPolicyJumpGroupFindByQuery.groupPolicyId = query.groupPolicyId;

        const groupPolicyJumpGroups = await this.groupPolicyJumpGroupRepositoryService.findBy(
            query.tenantId,
            groupPolicyJumpGroupFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return groupPolicyJumpGroups;
    }
}
