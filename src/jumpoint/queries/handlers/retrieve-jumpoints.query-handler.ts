import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere, Like } from 'typeorm';
import { JumpointRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jumpoint/dtos/outputs';
import { RetrieveJumpointsQuery as BTRetrieveJumpointsQuery } from '../../../beyondtrust-pra-conf-api/jumpoint/queries';
import { mapFromBTJumpointPlatformType, mapFromBTJzpClientAddressRestrictionsType } from '../../mappers';
import { Jumpoint } from '../../models';
import { JumpointEntity } from '../../repositories/entities';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { RetrieveJumpointsQuery } from '../retrieve-jumpoints.query';

@QueryHandler(RetrieveJumpointsQuery)
export class RetrieveJumpointsQueryHandler implements IQueryHandler<RetrieveJumpointsQuery> {
    constructor(
        private readonly jumpointRepositoryService: JumpointRepositoryService,
        private readonly queryBus: QueryBus,
    ) {}

    public async execute(query: RetrieveJumpointsQuery): Promise<Jumpoint[]> {
        if (query.hostname || query.publicIp || query.privateIp) {
            const btJumpoints = await this.queryBus.execute<BTRetrieveJumpointsQuery, JumpointRetrievedDtoOutput[]>(
                new BTRetrieveJumpointsQuery(
                    query.transactionId,
                    query.pageSize,
                    query.pageNumber,
                    query.name,
                    query.publicIp,
                    query.privateIp,
                    query.hostname,
                    query.codeName,
                ),
            );

            return btJumpoints.map((btJumpoint) => this.createJumpointEntity(btJumpoint));
        }

        const jumpointFindByQuery = <FindOptionsWhere<Jumpoint>>{};

        if (query.name !== undefined) {
            jumpointFindByQuery.name = query.name;
        }

        if (query.codeName !== undefined) {
            jumpointFindByQuery.codeName = query.codeName;
        }

        if (query.namePattern !== undefined) {
            jumpointFindByQuery.name = Like(query.namePattern);
        }

        const jumpoints = await this.jumpointRepositoryService.findBy(
            jumpointFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return jumpoints;
    }

    private createJumpointEntity(btJumpoint: JumpointRetrievedDtoOutput) {
        return JumpointEntity.create(
            btJumpoint.id,
            btJumpoint.name,
            mapFromBTJumpointPlatformType(btJumpoint.platform),
            btJumpoint.codeName,
            btJumpoint.comments,
            btJumpoint.enabled,
            btJumpoint.connected,
            btJumpoint.clustered,
            btJumpoint.shellJumpEnabled,
            btJumpoint.externalJumpItemNetworkId,
            btJumpoint.protocolTunnelEnabled,
            btJumpoint.rdpServiceAccountId,
            btJumpoint.managedIpRanges,
            btJumpoint.jzpEnabled,
            btJumpoint.jzpProxyHostname,
            btJumpoint.jzpProxyPort,
            btJumpoint.jzpAllowHttpGet,
            btJumpoint.jzpClientAddressRestrictionsType
                ? mapFromBTJzpClientAddressRestrictionsType(btJumpoint.jzpClientAddressRestrictionsType)
                : undefined,
            btJumpoint.jzpRestrictedIps,
            btJumpoint.dockerDeployKey,
            btJumpoint.keyInfo,
        );
    }
}
