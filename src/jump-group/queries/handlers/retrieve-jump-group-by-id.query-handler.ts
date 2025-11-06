import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JumpGroup } from '../../models';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { RetrieveJumpGroupByIdQuery } from '../retrieve-jump-group-by-id.query';

@QueryHandler(RetrieveJumpGroupByIdQuery)
export class RetrieveJumpGroupByIdQueryHandler implements IQueryHandler<RetrieveJumpGroupByIdQuery> {
    constructor(private readonly jumpGroupRepositoryService: JumpGroupRepositoryService) {}

    public async execute(query: RetrieveJumpGroupByIdQuery): Promise<JumpGroup> {
        const jumpGroup = await this.jumpGroupRepositoryService.findOneById(query.tenantId, query.id);

        if (!jumpGroup) {
            throw new NotFoundException(`Jump group with ID ${query.id} not found.`);
        }

        return jumpGroup;
    }
}
