import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Jumpoint } from '../../models';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { RetrieveJumpointByIdQuery } from '../retrieve-jumpoint-by-id.query';

@QueryHandler(RetrieveJumpointByIdQuery)
export class RetrieveJumpointByIdQueryHandler implements IQueryHandler<RetrieveJumpointByIdQuery> {
    constructor(private readonly jumpointRepositoryService: JumpointRepositoryService) {}

    public async execute(query: RetrieveJumpointByIdQuery): Promise<Jumpoint> {
        const jumpoint = await this.jumpointRepositoryService.findOneById(query.tenantId, query.id);

        if (!jumpoint) {
            throw new NotFoundException(`Jumpoint with ID ${query.id} not found.`);
        }

        return jumpoint;
    }
}
