import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JumpointNode } from '../../models';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { RetrieveJumpointNodeByIdQuery } from '../retrieve-jumpoint-node-by-id.query';

@QueryHandler(RetrieveJumpointNodeByIdQuery)
export class RetrieveJumpointNodeByIdQueryHandler implements IQueryHandler<RetrieveJumpointNodeByIdQuery> {
    constructor(private readonly jumpointNodeRepositoryService: JumpointNodeRepositoryService) {}

    public async execute(query: RetrieveJumpointNodeByIdQuery): Promise<JumpointNode> {
        const jumpointNode = await this.jumpointNodeRepositoryService.findOneById(query.id);

        if (!jumpointNode) {
            throw new NotFoundException(`Jumpoint Node with ID ${query.id} not found.`);
        }

        return jumpointNode;
    }
}
