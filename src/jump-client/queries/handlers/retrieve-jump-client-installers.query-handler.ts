import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { FindOptionsWhere, In } from 'typeorm';
import { JumpClientInstallerRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import { RetrieveJumpClientInstallersQuery as BTRetrieveJumpClientInstallersQuery } from '../../../beyondtrust-pra-conf-api/jump-client/queries';
import { mapFromBTJumpClientInstallerKeyInfo } from '../../mappers';
import { JumpClientInstaller } from '../../models';
import { JumpClientInstallerEntity } from '../../repositories/entities';
import { JumpClientInstallerRepositoryService } from '../../repositories/services/jump-client-installer-repository.service';
import { RetrieveJumpClientInstallersQuery } from '../retrieve-jump-client-installers.query';

@QueryHandler(RetrieveJumpClientInstallersQuery)
export class RetrieveJumpClientInstallersQueryHandler implements IQueryHandler<RetrieveJumpClientInstallersQuery> {
    constructor(
        private readonly jumpClientInstallerRepositoryService: JumpClientInstallerRepositoryService,
        private readonly queryBus: QueryBus,
    ) {}

    public async execute(query: RetrieveJumpClientInstallersQuery): Promise<JumpClientInstaller[]> {
        const jumpClientInstallerFindByQuery: FindOptionsWhere<JumpClientInstaller> = {};

        if (query.hostname || query.fqdn) {
            return this.retrieveBTJumpClientInstallers(query);
        }

        if (query.name !== undefined) {
            jumpClientInstallerFindByQuery.name = query.name;
        }

        if (query.tag !== undefined) {
            jumpClientInstallerFindByQuery.tag = query.tag;
        }

        if (query.jumpGroupIds !== undefined && query.jumpGroupIds.length > 0) {
            jumpClientInstallerFindByQuery.jumpGroupId = In(query.jumpGroupIds);
        }

        if (query.jumpGroupType !== undefined) {
            jumpClientInstallerFindByQuery.jumpGroupType = query.jumpGroupType;
        }

        if (query.connectionType !== undefined) {
            jumpClientInstallerFindByQuery.connectionType = query.connectionType;
        }

        if (query.installerId !== undefined) {
            jumpClientInstallerFindByQuery.installerId = query.installerId;
        }

        const jumpClientInstallers = await this.jumpClientInstallerRepositoryService.findBy(
            query.tenantId,
            jumpClientInstallerFindByQuery,
            query.pageNumber,
            query.pageSize,
        );

        return jumpClientInstallers;
    }

    private async retrieveBTJumpClientInstallers(query: RetrieveJumpClientInstallersQuery) {
        const btJumpClientInstaller = await this.queryBus.execute<
            BTRetrieveJumpClientInstallersQuery,
            JumpClientInstallerRetrievedDtoOutput[]
        >(
            new BTRetrieveJumpClientInstallersQuery(
                query.transactionId,
                query.tenantId,
                query.pageSize,
                query.pageNumber,
                query.name,
                query.hostname,
                query.fqdn,
                query.tag,
                query.jumpGroupIds?.[0], // BeyondTrust API only supports a single jump group id filter
                query.jumpGroupType,
                query.connectionType,
            ),
        );

        return btJumpClientInstaller.map((installer) =>
            JumpClientInstallerEntity.create(
                installer.id,
                installer.jumpGroupId,
                installer.jumpGroupType,
                installer.name,
                installer.tag,
                installer.comments,
                installer.jumpPolicyId,
                installer.sessionPolicyId,
                installer.connectionType,
                installer.expirationTimestamp,
                installer.maxOfflineMinutes,
                installer.elevateInstall,
                installer.elevatePrompt,
                installer.allowOverrideJumpGroup,
                installer.allowOverrideJumpPolicy,
                installer.allowOverrideName,
                installer.allowOverrideTag,
                installer.allowOverrideComments,
                installer.allowOverrideSessionPolicy,
                installer.installerId,
                installer.keyInfo ? mapFromBTJumpClientInstallerKeyInfo(installer.keyInfo) : [],
                installer.jumpointProxy,
            ),
        );
    }
}
