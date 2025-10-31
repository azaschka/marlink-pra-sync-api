import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere, Like } from 'typeorm';
import { GroupPolicy } from '../../models';
import { GroupPolicyEntity } from '../../repositories/entities';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { RetrieveGroupPoliciesQuery } from '../retrieve-group-policies.query';

@QueryHandler(RetrieveGroupPoliciesQuery)
export class RetrieveGroupPoliciesQueryHandler implements IQueryHandler<RetrieveGroupPoliciesQuery> {
    constructor(private readonly groupPolicyRepositoryService: GroupPolicyRepositoryService) {}

    public async execute(query: RetrieveGroupPoliciesQuery): Promise<GroupPolicy[]> {
        const multipleWhere: FindOptionsWhere<GroupPolicyEntity>[] = [];
        const singleWhere: FindOptionsWhere<GroupPolicyEntity> = {};

        if (query.name) {
            singleWhere.name = query.name;
        }

        if (query.namePatterns && query.namePatterns.length > 0) {
            for (const pattern of query.namePatterns) {
                multipleWhere.push({
                    ...singleWhere, // retain other filters
                    name: Like(pattern),
                });
            }
        } else {
            multipleWhere.push(singleWhere);
        }

        const groupPolicies = await this.groupPolicyRepositoryService.findBy(
            query.tenantId,
            multipleWhere,
            query.pageNumber,
            query.pageSize,
        );

        return groupPolicies;
    }
}
