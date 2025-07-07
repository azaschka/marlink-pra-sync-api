import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserGroupPolicy } from '../../models';
import { UserGroupPolicyRepositoryService } from '../../repositories/services/user-group-policy-repository.service';
import { RetrieveUserGroupPoliciesQuery } from '../retrieve-user-group-policies.query';

@QueryHandler(RetrieveUserGroupPoliciesQuery)
export class RetrieveUserGroupPoliciesQueryHandler implements IQueryHandler<RetrieveUserGroupPoliciesQuery> {
    constructor(private readonly userGroupPolicyRepositoryService: UserGroupPolicyRepositoryService) {}

    public async execute(query: RetrieveUserGroupPoliciesQuery): Promise<UserGroupPolicy[]> {
        const userGroupPolicyFindByQuery = <UserGroupPolicy>{};
        userGroupPolicyFindByQuery.userId = query.userId;

        const userGroupPolicies = await this.userGroupPolicyRepositoryService.findBy(
            userGroupPolicyFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return userGroupPolicies;
    }
}
