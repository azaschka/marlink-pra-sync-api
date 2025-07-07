import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TeamUser } from '../../models';
import { TeamUserRepositoryService } from '../../repositories/services/team-user-repository.service';
import { RetrieveTeamUsersQuery } from '../retrieve-team-users.query';

@QueryHandler(RetrieveTeamUsersQuery)
export class RetrieveTeamUsersQueryHandler implements IQueryHandler<RetrieveTeamUsersQuery> {
    constructor(private readonly teamUserRepositoryService: TeamUserRepositoryService) {}

    public async execute(query: RetrieveTeamUsersQuery): Promise<TeamUser[]> {
        const teamUserFindByQuery = <TeamUser>{};
        teamUserFindByQuery.teamId = query.teamId;

        const teamUsers = await this.teamUserRepositoryService.findBy(
            teamUserFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return teamUsers;
    }
}
