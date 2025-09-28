import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RemoteRdp } from '../../models';
import { RemoteRdpEntity } from '../../repositories/entities';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';
import { RetrieveRemoteRdpsQuery } from '../retrieve-remote-rdps.query';

@QueryHandler(RetrieveRemoteRdpsQuery)
export class RetrieveRemoteRdpsQueryHandler implements IQueryHandler<RetrieveRemoteRdpsQuery> {
    constructor(private readonly remoteRdpRepositoryService: RemoteRdpRepositoryService) {}

    public async execute(query: RetrieveRemoteRdpsQuery): Promise<RemoteRdp[]> {
        const remoteRdpsFindByQuery = <RemoteRdpEntity>{};

        if (query.name) {
            remoteRdpsFindByQuery.name = query.name;
        }

        if (query.hostname) {
            remoteRdpsFindByQuery.hostname = query.hostname;
        }

        if (query.jumpGroupId) {
            remoteRdpsFindByQuery.jumpGroupId = query.jumpGroupId;
        }

        if (query.jumpGroupType) {
            remoteRdpsFindByQuery.jumpGroupType = query.jumpGroupType;
        }

        if (query.jumpointId) {
            remoteRdpsFindByQuery.jumpointId = query.jumpointId;
        }

        if (query.endpointId) {
            remoteRdpsFindByQuery.endpointId = query.endpointId;
        }

        if (query.tag) {
            remoteRdpsFindByQuery.tag = query.tag;
        }

        const remoteRdps = await this.remoteRdpRepositoryService.findBy(
            query.tenantId,
            remoteRdpsFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return remoteRdps;
    }
}
