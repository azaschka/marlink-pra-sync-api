import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupPolicyTeam } from '../../models';
import { GroupPolicyTeamRepositoryService } from '../../repositories/services/group-policy-team-repository.service';
import { RetrieveGroupPolicyTeamsQuery } from '../retrieve-group-policy-teams.query';

@QueryHandler(RetrieveGroupPolicyTeamsQuery)
export class RetrieveGroupPolicyTeamsQueryHandler implements IQueryHandler<RetrieveGroupPolicyTeamsQuery> {
    constructor(private readonly groupPolicyTeamRepositoryService: GroupPolicyTeamRepositoryService) {}

    public async execute(query: RetrieveGroupPolicyTeamsQuery): Promise<GroupPolicyTeam[]> {
        const groupPolicyTeamFindByQuery = <GroupPolicyTeam>{};
        groupPolicyTeamFindByQuery.groupPolicyId = query.groupPolicyId;

        const groupPolicyTeams = await this.groupPolicyTeamRepositoryService.findBy(
            query.tenantId,
            groupPolicyTeamFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return groupPolicyTeams;
    }
}
