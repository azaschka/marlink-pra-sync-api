import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupPolicy } from '../../models';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { RetrieveGroupPolicyByIdQuery } from '../retrieve-group-policy-by-id.query';

@QueryHandler(RetrieveGroupPolicyByIdQuery)
export class RetrieveGroupPolicyByIdQueryHandler implements IQueryHandler<RetrieveGroupPolicyByIdQuery> {
    constructor(private readonly groupPolicyRepositoryService: GroupPolicyRepositoryService) {}

    public async execute(query: RetrieveGroupPolicyByIdQuery): Promise<GroupPolicy> {
        const groupPolicy = await this.groupPolicyRepositoryService.findOneById(query.tenantId, query.id);

        if (!groupPolicy) {
            throw new NotFoundException(`Group policy with ID ${query.id} not found.`);
        }

        return groupPolicy;
    }
}
