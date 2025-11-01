import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { WebJump } from '../../models';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { RetrieveWebJumpByIdQuery } from '../retrieve-web-jump-by-id.query';

@QueryHandler(RetrieveWebJumpByIdQuery)
export class RetrieveWebJumpByIdQueryHandler implements IQueryHandler<RetrieveWebJumpByIdQuery> {
    constructor(private readonly webJumpRepositoryService: WebJumpRepositoryService) {}

    public async execute(query: RetrieveWebJumpByIdQuery): Promise<WebJump> {
        const webJump = await this.webJumpRepositoryService.findOneById(query.tenantId, query.id);

        if (!webJump) {
            throw new NotFoundException(`Web jump with ID ${query.id} not found.`);
        }

        return webJump;
    }
}
