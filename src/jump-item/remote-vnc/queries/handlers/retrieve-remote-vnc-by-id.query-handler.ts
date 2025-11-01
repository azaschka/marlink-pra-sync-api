import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RemoteVnc } from '../../models';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { RetrieveRemoteVncByIdQuery } from '../retrieve-remote-vnc-by-id.query';

@QueryHandler(RetrieveRemoteVncByIdQuery)
export class RetrieveRemoteVncByIdQueryHandler implements IQueryHandler<RetrieveRemoteVncByIdQuery> {
    constructor(private readonly remoteVncRepositoryService: RemoteVncRepositoryService) {}

    public async execute(query: RetrieveRemoteVncByIdQuery): Promise<RemoteVnc> {
        const remoteVnc = await this.remoteVncRepositoryService.findOneById(query.tenantId, query.id);

        if (!remoteVnc) {
            throw new NotFoundException(`Remote VNC with ID ${query.id} not found.`);
        }

        return remoteVnc;
    }
}
