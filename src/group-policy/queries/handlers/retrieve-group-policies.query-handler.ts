import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere, Like } from 'typeorm';
import { GroupPolicy } from '../../models';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { RetrieveGroupPoliciesQuery } from '../retrieve-group-policies.query';

@QueryHandler(RetrieveGroupPoliciesQuery)
export class RetrieveGroupPoliciesQueryHandler implements IQueryHandler<RetrieveGroupPoliciesQuery> {
    constructor(private readonly groupPolicyRepositoryService: GroupPolicyRepositoryService) {}

    public async execute(query: RetrieveGroupPoliciesQuery): Promise<GroupPolicy[]> {
        const groupPoliciesFindByQuery = <FindOptionsWhere<GroupPolicy>>{};

        if (query.name) {
            groupPoliciesFindByQuery.name = query.name;
        }

        if (query.namePattern) {
            groupPoliciesFindByQuery.name = Like(query.namePattern);
        }

        const groupPolicies = await this.groupPolicyRepositoryService.findBy(
            groupPoliciesFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return groupPolicies;
    }
}
