import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JumpClient } from '../../models';
import { JumpClientRepositoryService } from '../../repositories/services/jump-client-repository.service';
import { RetrieveJumpClientByIdQuery } from '../retrieve-jump-client-by-id.query';

@QueryHandler(RetrieveJumpClientByIdQuery)
export class RetrieveJumpClientByIdQueryHandler implements IQueryHandler<RetrieveJumpClientByIdQuery> {
    constructor(private readonly jumpClientRepositoryService: JumpClientRepositoryService) {}

    public async execute(query: RetrieveJumpClientByIdQuery): Promise<JumpClient> {
        const jumpClient = await this.jumpClientRepositoryService.findOneById(query.tenantId, query.id);

        if (!jumpClient) {
            throw new NotFoundException(`Jump client with ID ${query.id} not found.`);
        }

        return jumpClient;
    }
}
