import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere, Like } from 'typeorm';
import { SessionPolicy } from '../../models';
import { SessionPolicyEntity } from '../../repositories/entities';
import { SessionPolicyRepositoryService } from '../../repositories/services/session-policy-repository.service';
import { RetrieveSessionPoliciesQuery } from '../retrieve-session-policies.query';

@QueryHandler(RetrieveSessionPoliciesQuery)
export class RetrieveSessionPoliciesQueryHandler implements IQueryHandler<RetrieveSessionPoliciesQuery> {
    constructor(private readonly sessionPolicyRepositoryService: SessionPolicyRepositoryService) {}

    public async execute(query: RetrieveSessionPoliciesQuery): Promise<SessionPolicy[]> {
        const multipleWhere: FindOptionsWhere<SessionPolicyEntity>[] = [];
        const singleWhere: FindOptionsWhere<SessionPolicyEntity> = {};

        if (query.displayName) {
            singleWhere.displayName = query.displayName;
        }

        if (query.codeName) {
            singleWhere.codeName = query.codeName;
        }

        if (query.codeNamePatterns && query.codeNamePatterns.length > 0) {
            for (const pattern of query.codeNamePatterns) {
                multipleWhere.push({
                    ...singleWhere, // retain other filters
                    codeName: Like(pattern),
                });
            }
        } else {
            multipleWhere.push(singleWhere);
        }

        const sessionPolicies = await this.sessionPolicyRepositoryService.findBy(
            query.tenantId,
            multipleWhere,
            query.pageNumber,
            query.pageSize,
        );

        return sessionPolicies;
    }
}
