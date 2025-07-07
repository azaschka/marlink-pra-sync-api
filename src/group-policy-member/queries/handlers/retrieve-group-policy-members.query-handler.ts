import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupPolicyMember } from '../../models';
import { GroupPolicyMemberRepositoryService } from '../../repositories/services/group-policy-member-repository.service';
import { RetrieveGroupPolicyMembersQuery } from '../retrieve-group-policy-members.query';

@QueryHandler(RetrieveGroupPolicyMembersQuery)
export class RetrieveGroupPolicyMembersQueryHandler implements IQueryHandler<RetrieveGroupPolicyMembersQuery> {
    constructor(private readonly groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService) {}

    public async execute(query: RetrieveGroupPolicyMembersQuery): Promise<GroupPolicyMember[]> {
        const groupPolicyMemberFindByQuery = <GroupPolicyMember>{};
        groupPolicyMemberFindByQuery.groupPolicyId = query.groupPolicyId;

        const groupPolicyMembers = await this.groupPolicyMemberRepositoryService.findBy(
            groupPolicyMemberFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return groupPolicyMembers;
    }
}
