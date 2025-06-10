import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProtocolTunnelJump } from '../../models';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { RetrieveProtocolTunnelJumpsQuery } from '../retrieve-protocol-tunnel-jumps.query';

@QueryHandler(RetrieveProtocolTunnelJumpsQuery)
export class RetrieveProtocolTunnelJumpsQueryHandler implements IQueryHandler<RetrieveProtocolTunnelJumpsQuery> {
    constructor(private readonly protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService) {}

    public async execute(query: RetrieveProtocolTunnelJumpsQuery): Promise<ProtocolTunnelJump[]> {
        const protocolTunnelJumpsFindByQuery = <ProtocolTunnelJump>{};

        if (query.name) {
            protocolTunnelJumpsFindByQuery.name = query.name;
        }

        if (query.hostname) {
            protocolTunnelJumpsFindByQuery.hostname = query.hostname;
        }

        if (query.jumpGroupId) {
            protocolTunnelJumpsFindByQuery.jumpGroupId = query.jumpGroupId;
        }

        if (query.jumpGroupType) {
            protocolTunnelJumpsFindByQuery.jumpGroupType = query.jumpGroupType;
        }

        if (query.jumpointId) {
            protocolTunnelJumpsFindByQuery.jumpointId = query.jumpointId;
        }

        if (query.tag) {
            protocolTunnelJumpsFindByQuery.tag = query.tag;
        }

        const protocolTunnelJumps = await this.protocolTunnelJumpRepositoryService.findBy(
            protocolTunnelJumpsFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return protocolTunnelJumps;
    }
}
