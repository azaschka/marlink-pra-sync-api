import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProtocolTunnelJump } from '../../models';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { RetrieveProtocolTunnelJumpByIdQuery } from '../retrieve-protocol-tunnel-jump-by-id.query';

@QueryHandler(RetrieveProtocolTunnelJumpByIdQuery)
export class RetrieveProtocolTunnelJumpByIdQueryHandler implements IQueryHandler<RetrieveProtocolTunnelJumpByIdQuery> {
    constructor(private readonly protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService) {}

    public async execute(query: RetrieveProtocolTunnelJumpByIdQuery): Promise<ProtocolTunnelJump> {
        const protocolTunnelJump = await this.protocolTunnelJumpRepositoryService.findOneById(query.tenantId, query.id);

        if (!protocolTunnelJump) {
            throw new NotFoundException(`Protocol tunnel jump with ID ${query.id} not found.`);
        }

        return protocolTunnelJump;
    }
}
