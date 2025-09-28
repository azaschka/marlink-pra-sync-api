import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { JumpClient } from '../../models';
import { JumpClientEntity } from '../../repositories/entities';
import { JumpClientRepositoryService } from '../../repositories/services/jump-client-repository.service';
import { RetrieveJumpClientsQuery } from '../retrieve-jump-clients.query';

@QueryHandler(RetrieveJumpClientsQuery)
export class RetrieveJumpClientsQueryHandler implements IQueryHandler<RetrieveJumpClientsQuery> {
    constructor(private readonly jumpClientRepositoryService: JumpClientRepositoryService) {}

    public async execute(query: RetrieveJumpClientsQuery): Promise<JumpClient[]> {
        const jumpClientFindByQuery = <JumpClientEntity>{};

        if (query.name !== undefined) {
            jumpClientFindByQuery.name = query.name;
        }

        if (query.hostname !== undefined) {
            jumpClientFindByQuery.hostname = query.hostname;
        }

        if (query.fqdn !== undefined) {
            jumpClientFindByQuery.fqdn = query.fqdn;
        }

        if (query.tag !== undefined) {
            jumpClientFindByQuery.tag = query.tag;
        }

        if (query.jumpGroupId !== undefined) {
            jumpClientFindByQuery.jumpGroupId = query.jumpGroupId;
        }

        if (query.jumpGroupType !== undefined) {
            jumpClientFindByQuery.jumpGroupType = query.jumpGroupType;
        }

        if (query.consoleUser !== undefined) {
            jumpClientFindByQuery.consoleUser = query.consoleUser;
        }

        if (query.publicIp !== undefined) {
            jumpClientFindByQuery.publicIp = query.publicIp;
        }

        if (query.privateIp !== undefined) {
            jumpClientFindByQuery.privateIp = query.privateIp;
        }

        if (query.connectionType !== undefined) {
            jumpClientFindByQuery.connectionType = query.connectionType;
        }

        const jumpClients = await this.jumpClientRepositoryService.findBy(
            query.tenantId,
            jumpClientFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return jumpClients;
    }
}
