import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupPolicyMember } from '../../models';
import { GroupPolicyMemberEntity } from '../../repositories/entities';
import { GroupPolicyMemberRepositoryService } from '../../repositories/services/group-policy-member-repository.service';
import { RetrieveGroupPolicyMembersQuery } from '../retrieve-group-policy-members.query';

@QueryHandler(RetrieveGroupPolicyMembersQuery)
export class RetrieveGroupPolicyMembersQueryHandler implements IQueryHandler<RetrieveGroupPolicyMembersQuery> {
    constructor(private readonly groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService) {}

    public async execute(query: RetrieveGroupPolicyMembersQuery): Promise<GroupPolicyMember[]> {
        const groupPolicyMemberFindByQuery = <GroupPolicyMemberEntity>{};
        groupPolicyMemberFindByQuery.groupPolicyId = query.groupPolicyId;

        const groupPolicyMembers = await this.groupPolicyMemberRepositoryService.findBy(
            query.tenantId,
            groupPolicyMemberFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return groupPolicyMembers;
    }
}
