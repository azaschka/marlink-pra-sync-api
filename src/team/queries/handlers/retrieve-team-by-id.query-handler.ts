import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Team } from '../../models';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { RetrieveTeamByIdQuery } from '../retrieve-team-by-id.query';

@QueryHandler(RetrieveTeamByIdQuery)
export class RetrieveTeamByIdQueryHandler implements IQueryHandler<RetrieveTeamByIdQuery> {
    constructor(private readonly teamRepositoryService: TeamRepositoryService) {}

    public async execute(query: RetrieveTeamByIdQuery): Promise<Team> {
        const team = await this.teamRepositoryService.findOneById(query.tenantId, query.id);

        if (!team) {
            throw new NotFoundException(`Team with ID ${query.id} not found.`);
        }

        return team;
    }
}
