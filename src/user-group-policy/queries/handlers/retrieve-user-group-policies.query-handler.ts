import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere, Like } from 'typeorm';
import { UserGroupPolicy } from '../../models';
import { UserGroupPolicyEntity } from '../../repositories/entities';
import { UserGroupPolicyRepositoryService } from '../../repositories/services/user-group-policy-repository.service';
import { RetrieveUserGroupPoliciesQuery } from '../retrieve-user-group-policies.query';

@QueryHandler(RetrieveUserGroupPoliciesQuery)
export class RetrieveUserGroupPoliciesQueryHandler implements IQueryHandler<RetrieveUserGroupPoliciesQuery> {
    constructor(private readonly userGroupPolicyRepositoryService: UserGroupPolicyRepositoryService) {}

    public async execute(query: RetrieveUserGroupPoliciesQuery): Promise<UserGroupPolicy[]> {
        const multipleWhere: FindOptionsWhere<UserGroupPolicyEntity>[] = [];
        const singleWhere: FindOptionsWhere<UserGroupPolicyEntity> = {};

        singleWhere.userId = query.userId;

        if (query.groupPolicyNamePatterns && query.groupPolicyNamePatterns.length > 0) {
            for (const pattern of query.groupPolicyNamePatterns) {
                multipleWhere.push({
                    ...singleWhere, // retain other filters
                    groupPolicy: {
                        name: Like(pattern),
                    },
                });
            }
        } else {
            multipleWhere.push(singleWhere);
        }

        const userGroupPolicies = await this.userGroupPolicyRepositoryService.findBy(
            query.tenantId,
            multipleWhere,
            query.pageNumber,
            query.pageSize,
        );

        return userGroupPolicies;
    }
}
