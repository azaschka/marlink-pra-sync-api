import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { WebJump } from '../../models';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { RetrieveWebJumpsQuery } from '../retrieve-web-jumps.query';

@QueryHandler(RetrieveWebJumpsQuery)
export class RetrieveWebJumpsQueryHandler implements IQueryHandler<RetrieveWebJumpsQuery> {
    constructor(private readonly webJumpRepositoryService: WebJumpRepositoryService) {}

    public async execute(query: RetrieveWebJumpsQuery): Promise<WebJump[]> {
        const webJumpsFindByQuery = <WebJump>{};

        if (query.name) {
            webJumpsFindByQuery.name = query.name;
        }

        if (query.url) {
            webJumpsFindByQuery.url = query.url;
        }

        if (query.jumpGroupId) {
            webJumpsFindByQuery.jumpGroupId = query.jumpGroupId;
        }

        if (query.jumpGroupType) {
            webJumpsFindByQuery.jumpGroupType = query.jumpGroupType;
        }

        if (query.jumpointId) {
            webJumpsFindByQuery.jumpointId = query.jumpointId;
        }

        if (query.tag) {
            webJumpsFindByQuery.tag = query.tag;
        }

        const webJumps = await this.webJumpRepositoryService.findBy(
            query.tenantId,
            webJumpsFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return webJumps;
    }
}
