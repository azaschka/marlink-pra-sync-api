import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere, In } from 'typeorm';
import { ProtocolTunnelJump } from '../../models';
import { ProtocolTunnelJumpEntity } from '../../repositories/entities';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { RetrieveProtocolTunnelJumpsQuery } from '../retrieve-protocol-tunnel-jumps.query';

@QueryHandler(RetrieveProtocolTunnelJumpsQuery)
export class RetrieveProtocolTunnelJumpsQueryHandler implements IQueryHandler<RetrieveProtocolTunnelJumpsQuery> {
    constructor(private readonly protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService) {}

    public async execute(query: RetrieveProtocolTunnelJumpsQuery): Promise<ProtocolTunnelJump[]> {
        const protocolTunnelJumpsFindByQuery: FindOptionsWhere<ProtocolTunnelJumpEntity> = {};

        if (query.name) {
            protocolTunnelJumpsFindByQuery.name = query.name;
        }

        if (query.hostname) {
            protocolTunnelJumpsFindByQuery.hostname = query.hostname;
        }

        if (query.jumpGroupIds !== undefined && query.jumpGroupIds.length > 0) {
            protocolTunnelJumpsFindByQuery.jumpGroupId = In(query.jumpGroupIds);
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
            query.tenantId,
            protocolTunnelJumpsFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return protocolTunnelJumps;
    }
}
