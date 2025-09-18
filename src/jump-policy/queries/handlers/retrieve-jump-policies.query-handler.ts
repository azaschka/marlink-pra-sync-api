import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JumpPolicy } from '../../models';
import { JumpPolicyRepositoryService } from '../../repositories/services/jump-policy-repository.service';
import { RetrieveJumpPoliciesQuery } from '../retrieve-jump-policies.query';

@QueryHandler(RetrieveJumpPoliciesQuery)
export class RetrieveJumpPoliciesQueryHandler implements IQueryHandler<RetrieveJumpPoliciesQuery> {
    constructor(private readonly jumpPolicyRepositoryService: JumpPolicyRepositoryService) {}

    public async execute(query: RetrieveJumpPoliciesQuery): Promise<JumpPolicy[]> {
        const jumpPoliciesFindByQuery = <JumpPolicy>{};

        if (query.codeName) {
            jumpPoliciesFindByQuery.codeName = query.codeName;
        }

        const jumpPolicies = await this.jumpPolicyRepositoryService.findBy(
            query.tenantId,
            jumpPoliciesFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return jumpPolicies;
    }
}
