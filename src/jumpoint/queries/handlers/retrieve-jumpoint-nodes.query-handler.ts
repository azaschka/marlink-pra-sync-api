import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere } from 'typeorm';
import { JumpointNode } from '../../models';
import { JumpointNodeEntity } from '../../repositories/entities';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { RetrieveJumpointNodesQuery } from '../retrieve-jumpoint-nodes.query';

@QueryHandler(RetrieveJumpointNodesQuery)
export class RetrieveJumpointNodesQueryHandler implements IQueryHandler<RetrieveJumpointNodesQuery> {
    constructor(private readonly jumpointNodeRepositoryService: JumpointNodeRepositoryService) {}

    public async execute(query: RetrieveJumpointNodesQuery): Promise<JumpointNode[]> {
        const jumpointNodeFindByQuery = <FindOptionsWhere<JumpointNodeEntity>>{};
        jumpointNodeFindByQuery.jumpointId = query.jumpointId;

        const jumpointNodes = await this.jumpointNodeRepositoryService.findBy(
            query.tenantId,
            jumpointNodeFindByQuery,
            undefined,
            undefined,
        );

        if (jumpointNodes.length === 0) {
            throw new NotFoundException(`Jumpoint node with jumpoint id ${query.jumpointId} not found.`);
        }

        return jumpointNodes;
    }
}
