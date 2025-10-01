import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RemoteVnc } from '../../models';
import { RemoteVncEntity } from '../../repositories/entities';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { RetrieveRemoteVncsQuery } from '../retrieve-remote-vncs.query';

@QueryHandler(RetrieveRemoteVncsQuery)
export class RetrieveRemoteVncsQueryHandler implements IQueryHandler<RetrieveRemoteVncsQuery> {
    constructor(private readonly remoteVncRepositoryService: RemoteVncRepositoryService) {}

    public async execute(query: RetrieveRemoteVncsQuery): Promise<RemoteVnc[]> {
        const remoteVncsFindByQuery = <RemoteVncEntity>{};

        if (query.name) {
            remoteVncsFindByQuery.name = query.name;
        }

        if (query.hostname) {
            remoteVncsFindByQuery.hostname = query.hostname;
        }

        if (query.jumpGroupId) {
            remoteVncsFindByQuery.jumpGroupId = query.jumpGroupId;
        }

        if (query.jumpGroupType) {
            remoteVncsFindByQuery.jumpGroupType = query.jumpGroupType;
        }

        if (query.jumpointId) {
            remoteVncsFindByQuery.jumpointId = query.jumpointId;
        }

        if (query.tag) {
            remoteVncsFindByQuery.tag = query.tag;
        }

        const remoteVncs = await this.remoteVncRepositoryService.findBy(
            query.tenantId,
            remoteVncsFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return remoteVncs;
    }
}
