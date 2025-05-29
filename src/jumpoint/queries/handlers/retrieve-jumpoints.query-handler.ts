import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Jumpoint } from '../../models';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { RetrieveJumpointsQuery } from '../retrieve-jumpoints.query';

@QueryHandler(RetrieveJumpointsQuery)
export class RetrieveJumpointsQueryHandler implements IQueryHandler<RetrieveJumpointsQuery> {
    constructor(private readonly jumpointRepositoryService: JumpointRepositoryService) {}

    public async execute(query: RetrieveJumpointsQuery): Promise<Jumpoint[]> {
        const jumpointFindByQuery = <Jumpoint>{};

        if (query.name !== undefined) {
            jumpointFindByQuery.name = query.name;
        }

        if (query.codeName !== undefined) {
            jumpointFindByQuery.codeName = query.codeName;
        }

        // TODO how to handle the hostname, publicIp, and privateIp ?
        // Request to BT directly?

        const jumpoints = await this.jumpointRepositoryService.findBy(
            jumpointFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return jumpoints;
    }
}
