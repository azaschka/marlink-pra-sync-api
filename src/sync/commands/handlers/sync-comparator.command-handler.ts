import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { differenceBy, differenceWith, intersectionBy, intersectionWith, isEqual } from 'lodash';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { GroupPolicyRetrievedDtoOutput as BTGroupPolicy } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { RetrieveGroupPoliciesQuery as BTRetrieveGroupPoliciesQuery } from '../../../beyondtrust-pra-conf-api/group-policy/queries';
import {
    JumpClientRetrievedDtoOutput as BTJumpClient,
    JumpClientInstallerRetrievedDtoOutput as BTJumpClientInstaller,
} from '../../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import {
    RetrieveJumpClientInstallersQuery as BTRetrieveJumpClientInstallersQuery,
    RetrieveJumpClientsQuery as BTRetrieveJumpClientsQuery,
} from '../../../beyondtrust-pra-conf-api/jump-client/queries';
import { JumpGroupRetrievedDtoOutput as BTJumpGroup } from '../../../beyondtrust-pra-conf-api/jump-group/dtos/outputs';
import { RetrieveJumpGroupsQuery as BTRetrieveJumpGroupsQuery } from '../../../beyondtrust-pra-conf-api/jump-group/queries';
import { ProtocolTunnelJumpRetrievedDtoOutput as BTProtocolTunnelJump } from '../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/dtos/outputs';
import { RetrieveProtocolTunnelJumpsQuery as BTRetrieveProtocolTunnelJumpsQuery } from '../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/queries';
import { RemoteRdpRetrievedDtoOutput as BTRemoteRdp } from '../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/dtos/outputs';
import { RetrieveRemoteRdpsQuery as BTRetrieveRemoteRdpsQuery } from '../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/queries';
import { RemoteVncRetrievedDtoOutput as BTRemoteVnc } from '../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/dtos/outputs';
import { RetrieveRemoteVncsQuery as BTRetrieveRemoteVncsQuery } from '../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/queries';
import { ShellJumpRetrievedDtoOutput as BTShellJump } from '../../../beyondtrust-pra-conf-api/jump-item/shell-jump/dtos/outputs';
import { RetrieveShellJumpsQuery as BTRetrieveShellJumpsQuery } from '../../../beyondtrust-pra-conf-api/jump-item/shell-jump/queries';
import { WebJumpRetrievedDtoOutput as BTWebJump } from '../../../beyondtrust-pra-conf-api/jump-item/web-jump/dtos/outputs';
import { RetrieveWebJumpsQuery as BTRetrieveWebJumpsQuery } from '../../../beyondtrust-pra-conf-api/jump-item/web-jump/queries';
import { JumpPolicyRetrievedDtoOutput as BTJumpPolicy } from '../../../beyondtrust-pra-conf-api/jump-policy/dtos/outputs';
import { RetrieveJumpPoliciesQuery as BTRetrieveJumpPoliciesQuery } from '../../../beyondtrust-pra-conf-api/jump-policy/queries';
import { JumpointRetrievedDtoOutput as BTJumpoint } from '../../../beyondtrust-pra-conf-api/jumpoint/dtos/outputs';
import { RetrieveJumpointsQuery as BTRetrieveJumpointsQuery } from '../../../beyondtrust-pra-conf-api/jumpoint/queries';
import { TeamRetrievedDtoOutput as BTTeam } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { RetrieveTeamsQuery as BTRetrieveTeamsQuery } from '../../../beyondtrust-pra-conf-api/team/queries';
import { UserRetrievedDtoOutput as BTUser } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import { RetrieveUsersQuery as BTRetrieveUsersQuery } from '../../../beyondtrust-pra-conf-api/user/queries';
import { MarkGroupPolicyAsSyncedCommand as DBMarkGroupPolicyAsSyncedCommand } from '../../../group-policy/commands';
import { GroupPolicy as DBGroupPolicy } from '../../../group-policy/models';
import { RetrieveGroupPoliciesQuery as DBRetrieveGroupPoliciesQuery } from '../../../group-policy/queries';
import { GroupPolicyEntity } from '../../../group-policy/repositories/entities';
import {
    MarkJumpClientAsSyncedCommand as DBMarkJumpClientAsSyncedCommand,
    MarkJumpClientInstallerAsSyncedCommand as DBMarkJumpClientInstallerAsSyncedCommand,
} from '../../../jump-client/commands';
import { JumpClient as DBJumpClient, JumpClientInstaller as DBJumpClientInstaller } from '../../../jump-client/models';
import {
    RetrieveJumpClientInstallersQuery as DBRetrieveJumpClientInstallersQuery,
    RetrieveJumpClientsQuery as DBRetrieveJumpClientsQuery,
} from '../../../jump-client/queries';
import { JumpClientEntity, JumpClientInstallerEntity } from '../../../jump-client/repositories/entities';
import { MarkJumpGroupAsSyncedCommand as DBMarkJumpGroupAsSyncedCommand } from '../../../jump-group/commands';
import { JumpGroup as DBJumpGroup } from '../../../jump-group/models';
import { RetrieveJumpGroupsQuery as DBRetrieveJumpGroupsQuery } from '../../../jump-group/queries';
import { JumpGroupEntity } from '../../../jump-group/repositories/entities';
import { MarkProtocolTunnelJumpAsSyncedCommand as DBMarkProtocolTunnelJumpAsSyncedCommand } from '../../../jump-item/protocol-tunnel-jump/commands';
import { ProtocolTunnelJump as DBProtocolTunnelJump } from '../../../jump-item/protocol-tunnel-jump/models';
import { RetrieveProtocolTunnelJumpsQuery as DBRetrieveProtocolTunnelJumpsQuery } from '../../../jump-item/protocol-tunnel-jump/queries';
import { ProtocolTunnelJumpEntity } from '../../../jump-item/protocol-tunnel-jump/repositories/entities';
import { MarkRemoteRdpAsSyncedCommand as DBMarkRemoteRdpAsSyncedCommand } from '../../../jump-item/remote-rdp/commands';
import { RemoteRdp as DBRemoteRdp } from '../../../jump-item/remote-rdp/models';
import { RetrieveRemoteRdpsQuery as DBRetrieveRemoteRdpsQuery } from '../../../jump-item/remote-rdp/queries';
import { RemoteRdpEntity } from '../../../jump-item/remote-rdp/repositories/entities';
import { MarkRemoteVncAsSyncedCommand as DBMarkRemoteVncAsSyncedCommand } from '../../../jump-item/remote-vnc/commands';
import { RemoteVnc as DBRemoteVnc } from '../../../jump-item/remote-vnc/models';
import { RetrieveRemoteVncsQuery as DBRetrieveRemoteVncsQuery } from '../../../jump-item/remote-vnc/queries';
import { RemoteVncEntity } from '../../../jump-item/remote-vnc/repositories/entities';
import { MarkShellJumpAsSyncedCommand as DBMarkShellJumpAsSyncedCommand } from '../../../jump-item/shell-jump/commands';
import { ShellJump as DBShellJump } from '../../../jump-item/shell-jump/models';
import { RetrieveShellJumpsQuery as DBRetrieveShellJumpsQuery } from '../../../jump-item/shell-jump/queries';
import { ShellJumpEntity } from '../../../jump-item/shell-jump/repositories/entities';
import { MarkWebJumpAsSyncedCommand as DBMarkWebJumpAsSyncedCommand } from '../../../jump-item/web-jump/commands';
import { WebJump as DBWebJump } from '../../../jump-item/web-jump/models';
import { RetrieveWebJumpsQuery as DBRetrieveWebJumpsQuery } from '../../../jump-item/web-jump/queries';
import { WebJumpEntity } from '../../../jump-item/web-jump/repositories/entities';
import { MarkJumpPolicyAsSyncedCommand as DBMarkJumpPolicyAsSyncedCommand } from '../../../jump-policy/commands';
import { JumpPolicy as DBJumpPolicy } from '../../../jump-policy/models';
import { RetrieveJumpPoliciesQuery as DBRetrieveJumpPoliciesQuery } from '../../../jump-policy/queries';
import { JumpPolicyEntity } from '../../../jump-policy/repositories/entities';
import { MarkJumpointAsSyncedCommand as DBMarkJumpointAsSyncedCommand } from '../../../jumpoint/commands';
import { Jumpoint as DBJumpoint } from '../../../jumpoint/models';
import { RetrieveJumpointsQuery as DBRetrieveJumpointsQuery } from '../../../jumpoint/queries';
import { JumpointEntity } from '../../../jumpoint/repositories/entities';
import { DateUtility, ObjectUtility, PaginationUtility } from '../../../shared/utilities';
import { MarkTeamAsSyncedCommand as DBMarkTeamAsSyncedCommand } from '../../../team/commands';
import { Team as DBTeam } from '../../../team/models';
import { RetrieveTeamsQuery as DBRetrieveTeamsQuery } from '../../../team/queries';
import { TeamEntity } from '../../../team/repositories/entities';
import { MarkUserAsSyncedCommand as DBMarkUserAsSyncedCommand } from '../../../user/commands';
import { User as DBUser } from '../../../user/models';
import { RetrieveUsersQuery as DBRetrieveUsersQuery } from '../../../user/queries';
import { UserEntity } from '../../../user/repositories/entities';
import { SyncEntityType } from '../../enums';
import { SyncStrategyMap } from '../../interfaces';
import { SyncComparisonOverview } from '../../models';
import { SyncDiscrepancyRepositoryService } from '../../repositories/services/sync-discrepancy-repository.service';
import { SyncStrategy } from '../../types';
import { SyncComparatorCommand } from '../sync-comparator.command';

@CommandHandler(SyncComparatorCommand)
export class SyncComparatorCommandHandler implements ICommandHandler<SyncComparatorCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly syncDiscrepancyRepositoryService: SyncDiscrepancyRepositoryService,
    ) {}

    public async execute(command: SyncComparatorCommand): Promise<SyncComparisonOverview> {
        const syncStrategy = this.getSyncStrategy(command.syncEntityType);

        const btData = (
            await PaginationUtility.queryUntilDuplicatePage(
                (pageNumber: number) =>
                    syncStrategy.btRetrieveFunc(
                        command.transactionId,
                        command.tenantId,
                        this.appConfigService.sync.maxBatchSize,
                        pageNumber,
                    ),
                syncStrategy.btOmittedPropsForDuplicateCheck,
            )
        )
            .map((btData) => syncStrategy.btToDbEntity(btData))
            .map((data) => ObjectUtility.stripProperties(data, ...syncStrategy.trimmedProps))
            .map((data) => JSON.parse(JSON.stringify(data)) as { id: number }); // Remove undefined values and convert to plain object

        const dbData = (
            await PaginationUtility.queryUntilLastPage((pageNumber: number) =>
                syncStrategy.dbRetrieveFunc(
                    command.transactionId,
                    command.tenantId,
                    this.appConfigService.sync.maxBatchSize,
                    pageNumber,
                ),
            )
        )
            .map((data) => ObjectUtility.stripProperties(data, ...syncStrategy.trimmedProps))
            .map((data) => JSON.parse(JSON.stringify(data)) as { id: number }); // Remove undefined values and convert to plain object

        // 1. identical
        const identicalData = intersectionWith(btData, dbData, isEqual);

        // 2. remaining
        const remainingBtData = differenceWith(btData, identicalData, isEqual);
        const remainingDbData = differenceWith(dbData, identicalData, isEqual);

        // 3. only in one side
        const onlyInBt = differenceBy(remainingBtData, remainingDbData, 'id');
        const onlyInDb = differenceBy(remainingDbData, remainingBtData, 'id');

        // 4. different content
        const differentDataPairs = intersectionBy(remainingBtData, remainingDbData, 'id')
            .map((bt) => {
                const db = remainingDbData.find((d) => d.id === bt.id);
                return db && !isEqual(bt, db) ? { bt, db } : null;
            })
            .filter((pair) => pair !== null);

        // Mark identical data as synced
        for (const data of identicalData) {
            await syncStrategy.dbMarkAsSyncedFunc(command.transactionId, command.tenantId, data.id);
        }

        // Handle data which only exist in BT
        for (const bt of onlyInBt) {
            const existingDiscrepancy = await this.syncDiscrepancyRepositoryService.findOneByBTIdEntityTypeAndEntityId(
                command.tenantId,
                command.syncEntityType,
                bt.id,
            );

            await this.syncDiscrepancyRepositoryService.createOrUpdateById({
                id: existingDiscrepancy?.id,
                beyondtrustInstanceId: command.tenantId,
                entityType: command.syncEntityType,
                entityId: bt.id,
                internalData: undefined,
                externalData: bt,
                lastModificationDate: DateUtility.getCurrentUtcDate(), // Force modification date to be updated
            });
        }

        // Handle data which only exist in DB
        for (const db of onlyInDb) {
            const existingDiscrepancy = await this.syncDiscrepancyRepositoryService.findOneByBTIdEntityTypeAndEntityId(
                command.tenantId,
                command.syncEntityType,
                db.id,
            );

            await this.syncDiscrepancyRepositoryService.createOrUpdateById({
                id: existingDiscrepancy?.id,
                beyondtrustInstanceId: command.tenantId,
                entityType: command.syncEntityType,
                entityId: db.id,
                internalData: db,
                externalData: undefined,
                lastModificationDate: DateUtility.getCurrentUtcDate(), // Force modification date to be updated
            });
        }

        // Handle data which have different content
        for (const pair of differentDataPairs) {
            const entityId = pair.bt.id; // use BT id to represent the entityId
            const existingDiscrepancy = await this.syncDiscrepancyRepositoryService.findOneByBTIdEntityTypeAndEntityId(
                command.tenantId,
                command.syncEntityType,
                entityId,
            );

            await this.syncDiscrepancyRepositoryService.createOrUpdateById({
                id: existingDiscrepancy?.id,
                beyondtrustInstanceId: command.tenantId,
                entityType: command.syncEntityType,
                entityId: entityId,
                internalData: pair.db,
                externalData: pair.bt,
                lastModificationDate: DateUtility.getCurrentUtcDate(), // Force modification date to be updated
            });
        }

        return {
            tenantId: command.tenantId,
            syncEntityType: command.syncEntityType,
            totalBtData: btData.length,
            totalDbData: dbData.length,
            identicalDataIds: identicalData.map((d) => d.id),
            onlyInBtIds: onlyInBt.map((d) => d.id),
            onlyInDbIds: onlyInDb.map((d) => d.id),
            differentDataIds: differentDataPairs.map((pair) => pair.bt.id),
        };
    }

    private getSyncStrategy(syncEntityType: SyncEntityType) {
        const syncStrategies: SyncStrategyMap = {
            [SyncEntityType.GroupPolicy]: {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveGroupPoliciesQuery, BTGroupPolicy[]>(
                        new BTRetrieveGroupPoliciesQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btToDbEntity: (bt) => GroupPolicyEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveGroupPoliciesQuery, DBGroupPolicy[]>(
                        new DBRetrieveGroupPoliciesQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkGroupPolicyAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: [
                    'lastSyncDate',
                    'userGroupPolicies',
                    'groupPolicyJumpoints',
                    'groupPolicyJumpGroups',
                    'groupPolicyMembers',
                    'groupPolicyTeams',
                ],
            },
            [SyncEntityType.JumpClientInstaller]: {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveJumpClientInstallersQuery, BTJumpClientInstaller[]>(
                        new BTRetrieveJumpClientInstallersQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btToDbEntity: (bt) => JumpClientInstallerEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveJumpClientInstallersQuery, DBJumpClientInstaller[]>(
                        new DBRetrieveJumpClientInstallersQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkJumpClientInstallerAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'keyInfo'],
            },
            [SyncEntityType.JumpClient]: {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveJumpClientsQuery, BTJumpClient[]>(
                        new BTRetrieveJumpClientsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btToDbEntity: (bt) => JumpClientEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveJumpClientsQuery, DBJumpClient[]>(
                        new DBRetrieveJumpClientsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkJumpClientAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'expirationDate', 'jumpGroup', 'jumpPolicy'],
            },
            [SyncEntityType.JumpGroup]: {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveJumpGroupsQuery, BTJumpGroup[]>(
                        new BTRetrieveJumpGroupsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btToDbEntity: (bt) => JumpGroupEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveJumpGroupsQuery, DBJumpGroup[]>(
                        new DBRetrieveJumpGroupsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkJumpGroupAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate'],
            },
            [SyncEntityType.JumpPolicy]: {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveJumpPoliciesQuery, BTJumpPolicy[]>(
                        new BTRetrieveJumpPoliciesQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btToDbEntity: (bt) => JumpPolicyEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveJumpPoliciesQuery, DBJumpPolicy[]>(
                        new DBRetrieveJumpPoliciesQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkJumpPolicyAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: [
                    'lastSyncDate',
                    'protocolTunnelJumps',
                    'remoteRdps',
                    'remoteVncs',
                    'shellJumps',
                    'webJumps',
                    'jumpClients',
                ],
            },
            [SyncEntityType.Jumpoint]: {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveJumpointsQuery, BTJumpoint[]>(
                        new BTRetrieveJumpointsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btOmittedPropsForDuplicateCheck: ['keyInfo'],
                btToDbEntity: (bt) => JumpointEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveJumpointsQuery, DBJumpoint[]>(
                        new DBRetrieveJumpointsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkJumpointAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: [
                    'lastSyncDate',
                    'externalJumpItemNetworkId',
                    'keyInfo',
                    'groupPolicyJumpoints',
                    'protocolTunnelJumps',
                    'remoteRdps',
                    'remoteVncs',
                    'shellJumps',
                    'webJumps',
                    'jumpointNodes',
                ],
            },
            [SyncEntityType.JumpItemProtocolTunnelJump]: {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveProtocolTunnelJumpsQuery, BTProtocolTunnelJump[]>(
                        new BTRetrieveProtocolTunnelJumpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btToDbEntity: (bt) => ProtocolTunnelJumpEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveProtocolTunnelJumpsQuery, DBProtocolTunnelJump[]>(
                        new DBRetrieveProtocolTunnelJumpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkProtocolTunnelJumpAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'jumpoint', 'jumpGroup', 'jumpPolicy'],
            },
            [SyncEntityType.JumpItemRemoteRdp]: {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveRemoteRdpsQuery, BTRemoteRdp[]>(
                        new BTRetrieveRemoteRdpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btToDbEntity: (bt) => RemoteRdpEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveRemoteRdpsQuery, DBRemoteRdp[]>(
                        new DBRetrieveRemoteRdpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkRemoteRdpAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'secureAppType', 'jumpoint', 'jumpGroup', 'jumpPolicy'],
            },
            [SyncEntityType.JumpItemRemoteVnc]: {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveRemoteVncsQuery, BTRemoteVnc[]>(
                        new BTRetrieveRemoteVncsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btToDbEntity: (bt) => RemoteVncEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveRemoteVncsQuery, DBRemoteVnc[]>(
                        new DBRetrieveRemoteVncsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkRemoteVncAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'jumpoint', 'jumpGroup', 'jumpPolicy'],
            },
            [SyncEntityType.JumpItemShellJump]: {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveShellJumpsQuery, BTShellJump[]>(
                        new BTRetrieveShellJumpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btToDbEntity: (bt) => ShellJumpEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveShellJumpsQuery, DBShellJump[]>(
                        new DBRetrieveShellJumpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkShellJumpAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'jumpoint', 'jumpGroup', 'jumpPolicy'],
            },
            [SyncEntityType.JumpItemWebJump]: {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveWebJumpsQuery, BTWebJump[]>(
                        new BTRetrieveWebJumpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btToDbEntity: (bt) => WebJumpEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveWebJumpsQuery, DBWebJump[]>(
                        new DBRetrieveWebJumpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkWebJumpAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'jumpoint', 'jumpGroup', 'jumpPolicy'],
            },
            [SyncEntityType.Team]: {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveTeamsQuery, BTTeam[]>(
                        new BTRetrieveTeamsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btToDbEntity: (bt) => TeamEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveTeamsQuery, DBTeam[]>(
                        new DBRetrieveTeamsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkTeamAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'teamUsers', 'groupPolicyTeams'],
            },
            [SyncEntityType.User]: {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveUsersQuery, BTUser[]>(
                        new BTRetrieveUsersQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btToDbEntity: (bt) => UserEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveUsersQuery, DBUser[]>(
                        new DBRetrieveUsersQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkUserAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: [
                    'lastSyncDate',
                    'fido2CredentialCount',
                    'fido2LastUsedDate',
                    'userGroupPolicies',
                    'teamUsers',
                    'groupPolicyMembers',
                ],
            },
        };

        // use "as SyncStrategy<BTGroupPolicy, DBGroupPolicy, GroupPolicyEntity>" to avoid type issue
        const syncStrategy = syncStrategies[syncEntityType as keyof SyncStrategyMap] as
            | SyncStrategy<BTGroupPolicy, DBGroupPolicy, GroupPolicyEntity>
            | undefined;

        if (!syncStrategy) {
            throw new Error(`Unsupported sync entity type: ${syncEntityType}`);
        }

        return syncStrategy;
    }
}
