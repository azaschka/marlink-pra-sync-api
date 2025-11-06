import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere, Like } from 'typeorm';
import { JumpGroup } from '../../models';
import { JumpGroupEntity } from '../../repositories/entities';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { RetrieveJumpGroupsQuery } from '../retrieve-jump-groups.query';

@QueryHandler(RetrieveJumpGroupsQuery)
export class RetrieveJumpGroupsQueryHandler implements IQueryHandler<RetrieveJumpGroupsQuery> {
    constructor(private readonly jumpGroupRepositoryService: JumpGroupRepositoryService) {}

    public async execute(query: RetrieveJumpGroupsQuery): Promise<JumpGroup[]> {
        const multipleWhere: FindOptionsWhere<JumpGroupEntity>[] = [];
        const singleWhere: FindOptionsWhere<JumpGroupEntity> = {};

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

        const jumpGroups = await this.jumpGroupRepositoryService.findBy(
            query.tenantId,
            multipleWhere,
            query.pageNumber,
            query.pageSize,
        );

        return jumpGroups;
    }
}
