import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere, Like } from 'typeorm';
import { JumpPolicy } from '../../models';
import { JumpPolicyEntity } from '../../repositories/entities';
import { JumpPolicyRepositoryService } from '../../repositories/services/jump-policy-repository.service';
import { RetrieveJumpPoliciesQuery } from '../retrieve-jump-policies.query';

@QueryHandler(RetrieveJumpPoliciesQuery)
export class RetrieveJumpPoliciesQueryHandler implements IQueryHandler<RetrieveJumpPoliciesQuery> {
    constructor(private readonly jumpPolicyRepositoryService: JumpPolicyRepositoryService) {}

    public async execute(query: RetrieveJumpPoliciesQuery): Promise<JumpPolicy[]> {
        const multipleWhere: FindOptionsWhere<JumpPolicyEntity>[] = [];
        const singleWhere: FindOptionsWhere<JumpPolicyEntity> = {};

        if (query.codeName) {
            singleWhere.codeName = query.codeName;
        }

        if (query.displayNamePatterns && query.displayNamePatterns.length > 0) {
            for (const pattern of query.displayNamePatterns) {
                multipleWhere.push({
                    ...singleWhere, // retain other filters
                    displayName: Like(pattern),
                });
            }
        } else {
            multipleWhere.push(singleWhere);
        }

        const jumpPolicies = await this.jumpPolicyRepositoryService.findBy(
            query.tenantId,
            multipleWhere,
            query.pageNumber,
            query.pageSize,
        );

        return jumpPolicies;
    }
}
