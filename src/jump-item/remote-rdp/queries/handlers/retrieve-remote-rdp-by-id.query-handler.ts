import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RemoteRdp } from '../../models';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';
import { RetrieveRemoteRdpByIdQuery } from '../retrieve-remote-rdp-by-id.query';

@QueryHandler(RetrieveRemoteRdpByIdQuery)
export class RetrieveRemoteRdpByIdQueryHandler implements IQueryHandler<RetrieveRemoteRdpByIdQuery> {
    constructor(private readonly remoteRdpRepositoryService: RemoteRdpRepositoryService) {}

    public async execute(query: RetrieveRemoteRdpByIdQuery): Promise<RemoteRdp> {
        const remoteRdp = await this.remoteRdpRepositoryService.findOneById(query.tenantId, query.id);

        if (!remoteRdp) {
            throw new NotFoundException(`Remote RDP with ID ${query.id} not found.`);
        }

        return remoteRdp;
    }
}
