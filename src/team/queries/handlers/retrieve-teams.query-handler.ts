import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Team } from '../../models';
import { TeamEntity } from '../../repositories/entities';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { RetrieveTeamsQuery } from '../retrieve-teams.query';

@QueryHandler(RetrieveTeamsQuery)
export class RetrieveTeamsQueryHandler implements IQueryHandler<RetrieveTeamsQuery> {
    constructor(private readonly teamRepositoryService: TeamRepositoryService) {}

    public async execute(query: RetrieveTeamsQuery): Promise<Team[]> {
        const teamsFindByQuery = <TeamEntity>{};

        if (query.name) {
            teamsFindByQuery.name = query.name;
        }

        if (query.codeName) {
            teamsFindByQuery.codeName = query.codeName;
        }

        const teams = await this.teamRepositoryService.findBy(
            query.tenantId,
            teamsFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return teams;
    }
}
