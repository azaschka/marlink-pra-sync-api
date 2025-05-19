import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JumpGroup } from '../../models';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { RetrieveJumpGroupsQuery } from '../retrieve-jump-groups.query';

@QueryHandler(RetrieveJumpGroupsQuery)
export class RetrieveJumpGroupsQueryHandler implements IQueryHandler<RetrieveJumpGroupsQuery> {
    constructor(private readonly jumpGroupRepositoryService: JumpGroupRepositoryService) {}

    public async execute(query: RetrieveJumpGroupsQuery): Promise<JumpGroup[]> {
        const jumpGroupsFindByQuery = <JumpGroup>{};

        if (query.name) {
            jumpGroupsFindByQuery.name = query.name;
        }

        if (query.codeName) {
            jumpGroupsFindByQuery.codeName = query.codeName;
        }

        const jumpGroups = await this.jumpGroupRepositoryService.findBy(
            jumpGroupsFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return jumpGroups;
    }
}
