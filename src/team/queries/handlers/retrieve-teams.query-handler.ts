import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere, Like } from 'typeorm';
import { Team } from '../../models';
import { TeamEntity } from '../../repositories/entities';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { RetrieveTeamsQuery } from '../retrieve-teams.query';

@QueryHandler(RetrieveTeamsQuery)
export class RetrieveTeamsQueryHandler implements IQueryHandler<RetrieveTeamsQuery> {
    constructor(private readonly teamRepositoryService: TeamRepositoryService) {}

    public async execute(query: RetrieveTeamsQuery): Promise<Team[]> {
        const multipleWhere: FindOptionsWhere<TeamEntity>[] = [];
        const singleWhere: FindOptionsWhere<TeamEntity> = {};

        if (query.name) {
            singleWhere.name = query.name;
        }

        if (query.codeName) {
            singleWhere.codeName = query.codeName;
        }

        if (query.namePatterns && query.namePatterns.length > 0) {
            for (const pattern of query.namePatterns) {
                multipleWhere.push({
                    ...singleWhere, // retain other filters
                    name: Like(pattern),
                });
            }
        } else {
            multipleWhere.push(singleWhere);
        }

        const teams = await this.teamRepositoryService.findBy(
            query.tenantId,
            multipleWhere,
            query.pageNumber,
            query.pageSize,
        );

        return teams;
    }
}
