import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupPolicyJumpoint } from '../../models';
import { GroupPolicyJumpointRepositoryService } from '../../repositories/services/group-policy-jumpoint-repository.service';
import { RetrieveGroupPolicyJumpointsQuery } from '../retrieve-group-policy-jumpoints.query';

@QueryHandler(RetrieveGroupPolicyJumpointsQuery)
export class RetrieveGroupPolicyJumpointsQueryHandler implements IQueryHandler<RetrieveGroupPolicyJumpointsQuery> {
    constructor(private readonly groupPolicyJumpointRepositoryService: GroupPolicyJumpointRepositoryService) {}

    public async execute(query: RetrieveGroupPolicyJumpointsQuery): Promise<GroupPolicyJumpoint[]> {
        const groupPolicyJumpointFindByQuery = <GroupPolicyJumpoint>{};
        groupPolicyJumpointFindByQuery.groupPolicyId = query.groupPolicyId;

        const groupPolicyJumpoints = await this.groupPolicyJumpointRepositoryService.findBy(
            query.tenantId,
            groupPolicyJumpointFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return groupPolicyJumpoints;
    }
}
