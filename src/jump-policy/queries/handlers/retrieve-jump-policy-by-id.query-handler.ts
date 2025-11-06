import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JumpPolicy } from '../../models';
import { JumpPolicyRepositoryService } from '../../repositories/services/jump-policy-repository.service';
import { RetrieveJumpPolicyByIdQuery } from '../retrieve-jump-policy-by-id.query';

@QueryHandler(RetrieveJumpPolicyByIdQuery)
export class RetrieveJumpPolicyByIdQueryHandler implements IQueryHandler<RetrieveJumpPolicyByIdQuery> {
    constructor(private readonly jumpPolicyRepositoryService: JumpPolicyRepositoryService) {}

    public async execute(query: RetrieveJumpPolicyByIdQuery): Promise<JumpPolicy> {
        const jumpPolicy = await this.jumpPolicyRepositoryService.findOneById(query.tenantId, query.id);

        if (!jumpPolicy) {
            throw new NotFoundException(`Jump policy with ID ${query.id} not found.`);
        }

        return jumpPolicy;
    }
}
