import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
    CreateGroupPolicyCommand as BTCreateGroupPolicyCommand,
    DeleteGroupPolicyCommand as BTDeleteGroupPolicyCommand,
    ModifyGroupPolicyCommand as BTModifyGroupPolicyCommand,
} from '../../beyondtrust-pra-conf-api/group-policy/commands';
import {
    GroupPolicyRetrievedDtoOutput as BTGroupPolicy,
    GroupPolicyJumpGroupRetrievedDtoOutput as BTGroupPolicyJumpGroup,
    GroupPolicyJumpointRetrievedDtoOutput as BTGroupPolicyJumpoint,
    GroupPolicyMemberRetrievedDtoOutput as BTGroupPolicyMember,
    GroupPolicyTeamRetrievedDtoOutput as BTGroupPolicyTeam,
} from '../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import {
    RetrieveGroupPoliciesQuery as BTRetrieveGroupPoliciesQuery,
    RetrieveGroupPolicyJumpGroupsQuery as BTRetrieveGroupPolicyJumpGroupsQuery,
    RetrieveGroupPolicyJumpointsQuery as BTRetrieveGroupPolicyJumpointsQuery,
    RetrieveGroupPolicyMembersQuery as BTRetrieveGroupPolicyMembersQuery,
    RetrieveGroupPolicyTeamsQuery as BTRetrieveGroupPolicyTeamsQuery,
} from '../../beyondtrust-pra-conf-api/group-policy/queries';
import {
    CreateJumpClientInstallerCommand as BTCreateJumpClientInstallerCommand,
    DeleteJumpClientCommand as BTDeleteJumpClientCommand,
    DeleteJumpClientInstallerCommand as BTDeleteJumpClientInstallerCommand,
    ModifyJumpClientCommand as BTModifyJumpClientCommand,
} from '../../beyondtrust-pra-conf-api/jump-client/commands';
import {
    JumpClientRetrievedDtoOutput as BTJumpClient,
    JumpClientInstallerRetrievedDtoOutput as BTJumpClientInstaller,
} from '../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import {
    RetrieveJumpClientInstallersQuery as BTRetrieveJumpClientInstallersQuery,
    RetrieveJumpClientsQuery as BTRetrieveJumpClientsQuery,
} from '../../beyondtrust-pra-conf-api/jump-client/queries';
import {
    CreateJumpGroupCommand as BTCreateJumpGroupCommand,
    DeleteJumpGroupCommand as BTDeleteJumpGroupCommand,
    ModifyJumpGroupCommand as BTModifyJumpGroupCommand,
} from '../../beyondtrust-pra-conf-api/jump-group/commands';
import { JumpGroupRetrievedDtoOutput as BTJumpGroup } from '../../beyondtrust-pra-conf-api/jump-group/dtos/outputs';
import { RetrieveJumpGroupsQuery as BTRetrieveJumpGroupsQuery } from '../../beyondtrust-pra-conf-api/jump-group/queries';
import {
    CreateProtocolTunnelJumpCommand as BTCreateProtocolTunnelJumpCommand,
    DeleteProtocolTunnelJumpCommand as BTDeleteProtocolTunnelJumpCommand,
    ModifyProtocolTunnelJumpCommand as BTModifyProtocolTunnelJumpCommand,
} from '../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/commands';
import { ProtocolTunnelJumpRetrievedDtoOutput as BTProtocolTunnelJump } from '../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/dtos/outputs';
import { RetrieveProtocolTunnelJumpsQuery as BTRetrieveProtocolTunnelJumpsQuery } from '../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/queries';
import {
    CreateRemoteRdpCommand as BTCreateRemoteRdpCommand,
    DeleteRemoteRdpCommand as BTDeleteRemoteRdpCommand,
    ModifyRemoteRdpCommand as BTModifyRemoteRdpCommand,
} from '../../beyondtrust-pra-conf-api/jump-item/remote-rdp/commands';
import { RemoteRdpRetrievedDtoOutput as BTRemoteRdp } from '../../beyondtrust-pra-conf-api/jump-item/remote-rdp/dtos/outputs';
import { RetrieveRemoteRdpsQuery as BTRetrieveRemoteRdpsQuery } from '../../beyondtrust-pra-conf-api/jump-item/remote-rdp/queries';
import {
    CreateRemoteVncCommand as BTCreateRemoteVncCommand,
    DeleteRemoteVncCommand as BTDeleteRemoteVncCommand,
    ModifyRemoteVncCommand as BTModifyRemoteVncCommand,
} from '../../beyondtrust-pra-conf-api/jump-item/remote-vnc/commands';
import { RemoteVncRetrievedDtoOutput as BTRemoteVnc } from '../../beyondtrust-pra-conf-api/jump-item/remote-vnc/dtos/outputs';
import { RetrieveRemoteVncsQuery as BTRetrieveRemoteVncsQuery } from '../../beyondtrust-pra-conf-api/jump-item/remote-vnc/queries';
import {
    CreateShellJumpCommand as BTCreateShellJumpCommand,
    DeleteShellJumpCommand as BTDeleteShellJumpCommand,
    ModifyShellJumpCommand as BTModifyShellJumpCommand,
} from '../../beyondtrust-pra-conf-api/jump-item/shell-jump/commands';
import { ShellJumpRetrievedDtoOutput as BTShellJump } from '../../beyondtrust-pra-conf-api/jump-item/shell-jump/dtos/outputs';
import { RetrieveShellJumpsQuery as BTRetrieveShellJumpsQuery } from '../../beyondtrust-pra-conf-api/jump-item/shell-jump/queries';
import {
    CreateWebJumpCommand as BTCreateWebJumpCommand,
    DeleteWebJumpCommand as BTDeleteWebJumpCommand,
    ModifyWebJumpCommand as BTModifyWebJumpCommand,
} from '../../beyondtrust-pra-conf-api/jump-item/web-jump/commands';
import { WebJumpRetrievedDtoOutput as BTWebJump } from '../../beyondtrust-pra-conf-api/jump-item/web-jump/dtos/outputs';
import { RetrieveWebJumpsQuery as BTRetrieveWebJumpsQuery } from '../../beyondtrust-pra-conf-api/jump-item/web-jump/queries';
import {
    CreateJumpPolicyCommand as BTCreateJumpPolicyCommand,
    DeleteJumpPolicyCommand as BTDeleteJumpPolicyCommand,
    ModifyJumpPolicyCommand as BTModifyJumpPolicyCommand,
} from '../../beyondtrust-pra-conf-api/jump-policy/commands';
import { JumpPolicyRetrievedDtoOutput as BTJumpPolicy } from '../../beyondtrust-pra-conf-api/jump-policy/dtos/outputs';
import { RetrieveJumpPoliciesQuery as BTRetrieveJumpPoliciesQuery } from '../../beyondtrust-pra-conf-api/jump-policy/queries';
import {
    CreateJumpointCommand as BTCreateJumpointCommand,
    DeleteJumpointCommand as BTDeleteJumpointCommand,
    ModifyJumpointCommand as BTModifyJumpointCommand,
} from '../../beyondtrust-pra-conf-api/jumpoint/commands';
import {
    JumpointRetrievedDtoOutput as BTJumpoint,
    JumpointNodeRetrievedDtoOutput as BTJumpointNode,
} from '../../beyondtrust-pra-conf-api/jumpoint/dtos/outputs';
import {
    RetrieveJumpointNodesQuery as BTRetrieveJumpointNodesQuery,
    RetrieveJumpointsQuery as BTRetrieveJumpointsQuery,
} from '../../beyondtrust-pra-conf-api/jumpoint/queries';
import {
    CreateTeamCommand as BTCreateTeamCommand,
    DeleteTeamCommand as BTDeleteTeamCommand,
    ModifyTeamCommand as BTModifyTeamCommand,
} from '../../beyondtrust-pra-conf-api/team/commands';
import {
    TeamRetrievedDtoOutput as BTTeam,
    TeamUserRetrievedDtoOutput as BTTeamUser,
} from '../../beyondtrust-pra-conf-api/team/dtos/outputs';
import {
    RetrieveTeamsQuery as BTRetrieveTeamsQuery,
    RetrieveTeamUsersQuery as BTRetrieveTeamUsersQuery,
} from '../../beyondtrust-pra-conf-api/team/queries';
import {
    CreateUserCommand as BTCreateUserCommand,
    DeleteUserCommand as BTDeleteUserCommand,
    ModifyUserCommand as BTModifyUserCommand,
} from '../../beyondtrust-pra-conf-api/user/commands';
import {
    UserRetrievedDtoOutput as BTUser,
    UserGroupPolicyRetrievedDtoOutput as BTUserGroupPolicy,
} from '../../beyondtrust-pra-conf-api/user/dtos/outputs';
import {
    RetrieveUserGroupPoliciesQuery as BTRetrieveUserGroupPoliciesQuery,
    RetrieveUsersQuery as BTRetrieveUsersQuery,
} from '../../beyondtrust-pra-conf-api/user/queries';
import { MarkGroupPolicyJumpGroupAsSyncedCommand as DBMarkGroupPolicyJumpGroupAsSyncedCommand } from '../../group-policy-jump-group/commands';
import { GroupPolicyJumpGroup as DBGroupPolicyJumpGroup } from '../../group-policy-jump-group/models';
import { RetrieveGroupPolicyJumpGroupsQuery as DBRetrieveGroupPolicyJumpGroupsQuery } from '../../group-policy-jump-group/queries';
import { GroupPolicyJumpGroupEntity } from '../../group-policy-jump-group/repositories/entities';
import { MarkGroupPolicyJumpointAsSyncedCommand as DBMarkGroupPolicyJumpointAsSyncedCommand } from '../../group-policy-jumpoint/commands';
import { GroupPolicyJumpoint as DBGroupPolicyJumpoint } from '../../group-policy-jumpoint/models';
import { RetrieveGroupPolicyJumpointsQuery as DBRetrieveGroupPolicyJumpointsQuery } from '../../group-policy-jumpoint/queries';
import { GroupPolicyJumpointEntity } from '../../group-policy-jumpoint/repositories/entities';
import { MarkGroupPolicyMemberAsSyncedCommand as DBMarkGroupPolicyMemberAsSyncedCommand } from '../../group-policy-member/commands';
import { GroupPolicyMember as DBGroupPolicyMember } from '../../group-policy-member/models';
import { RetrieveGroupPolicyMembersQuery as DBRetrieveGroupPolicyMembersQuery } from '../../group-policy-member/queries';
import { GroupPolicyMemberEntity } from '../../group-policy-member/repositories/entities';
import { MarkGroupPolicyTeamAsSyncedCommand as DBMarkGroupPolicyTeamAsSyncedCommand } from '../../group-policy-team/commands';
import { GroupPolicyTeam as DBGroupPolicyTeam } from '../../group-policy-team/models';
import { RetrieveGroupPolicyTeamsQuery as DBRetrieveGroupPolicyTeamsQuery } from '../../group-policy-team/queries';
import { GroupPolicyTeamEntity } from '../../group-policy-team/repositories/entities';
import { MarkGroupPolicyAsSyncedCommand as DBMarkGroupPolicyAsSyncedCommand } from '../../group-policy/commands';
import { mapToBTAccessPermissionStatusType } from '../../group-policy/mappers';
import { GroupPolicy as DBGroupPolicy } from '../../group-policy/models';
import { RetrieveGroupPoliciesQuery as DBRetrieveGroupPoliciesQuery } from '../../group-policy/queries';
import { GroupPolicyEntity } from '../../group-policy/repositories/entities';
import { GroupPolicyService } from '../../group-policy/services/group-policy.service';
import {
    MarkJumpClientAsSyncedCommand as DBMarkJumpClientAsSyncedCommand,
    MarkJumpClientInstallerAsSyncedCommand as DBMarkJumpClientInstallerAsSyncedCommand,
} from '../../jump-client/commands';
import { mapToBTJumpClientEndpointAgreementPolicyType, mapToBTJumpClientGroupType } from '../../jump-client/mappers';
import { JumpClient as DBJumpClient, JumpClientInstaller as DBJumpClientInstaller } from '../../jump-client/models';
import {
    RetrieveJumpClientInstallersQuery as DBRetrieveJumpClientInstallersQuery,
    RetrieveJumpClientsQuery as DBRetrieveJumpClientsQuery,
} from '../../jump-client/queries';
import { JumpClientEntity, JumpClientInstallerEntity } from '../../jump-client/repositories/entities';
import { JumpClientInstallerService } from '../../jump-client/services/jump-client-installer.service';
import { JumpClientService } from '../../jump-client/services/jump-client.service';
import { MarkJumpGroupAsSyncedCommand as DBMarkJumpGroupAsSyncedCommand } from '../../jump-group/commands';
import { JumpGroup as DBJumpGroup } from '../../jump-group/models';
import { RetrieveJumpGroupsQuery as DBRetrieveJumpGroupsQuery } from '../../jump-group/queries';
import { JumpGroupEntity } from '../../jump-group/repositories/entities';
import { JumpGroupService } from '../../jump-group/services/jump-group.service';
import { MarkProtocolTunnelJumpAsSyncedCommand as DBMarkProtocolTunnelJumpAsSyncedCommand } from '../../jump-item/protocol-tunnel-jump/commands';
import { mapToBTTunnelType } from '../../jump-item/protocol-tunnel-jump/mappers';
import { ProtocolTunnelJump as DBProtocolTunnelJump } from '../../jump-item/protocol-tunnel-jump/models';
import { RetrieveProtocolTunnelJumpsQuery as DBRetrieveProtocolTunnelJumpsQuery } from '../../jump-item/protocol-tunnel-jump/queries';
import { ProtocolTunnelJumpEntity } from '../../jump-item/protocol-tunnel-jump/repositories/entities';
import { ProtocolTunnelJumpService } from '../../jump-item/protocol-tunnel-jump/services/protocol-tunnel-jump.service';
import { MarkRemoteRdpAsSyncedCommand as DBMarkRemoteRdpAsSyncedCommand } from '../../jump-item/remote-rdp/commands';
import { mapToBTJumpGroupType, mapToBTRdpQualityMode, mapToBTSecureAppType } from '../../jump-item/remote-rdp/mappers';
import { RemoteRdp as DBRemoteRdp } from '../../jump-item/remote-rdp/models';
import { RetrieveRemoteRdpsQuery as DBRetrieveRemoteRdpsQuery } from '../../jump-item/remote-rdp/queries';
import { RemoteRdpEntity } from '../../jump-item/remote-rdp/repositories/entities';
import { RemoteRdpService } from '../../jump-item/remote-rdp/services/remote-rdp.service';
import { MarkRemoteVncAsSyncedCommand as DBMarkRemoteVncAsSyncedCommand } from '../../jump-item/remote-vnc/commands';
import { RemoteVnc as DBRemoteVnc } from '../../jump-item/remote-vnc/models';
import { RetrieveRemoteVncsQuery as DBRetrieveRemoteVncsQuery } from '../../jump-item/remote-vnc/queries';
import { RemoteVncEntity } from '../../jump-item/remote-vnc/repositories/entities';
import { RemoteVncService } from '../../jump-item/remote-vnc/services/remote-vnc.service';
import { MarkShellJumpAsSyncedCommand as DBMarkShellJumpAsSyncedCommand } from '../../jump-item/shell-jump/commands';
import { mapToBTShellJumpProtocolType, mapToBTShellJumpTerminalType } from '../../jump-item/shell-jump/mappers';
import { ShellJump as DBShellJump } from '../../jump-item/shell-jump/models';
import { RetrieveShellJumpsQuery as DBRetrieveShellJumpsQuery } from '../../jump-item/shell-jump/queries';
import { ShellJumpEntity } from '../../jump-item/shell-jump/repositories/entities';
import { ShellJumpService } from '../../jump-item/shell-jump/services/shell-jump.service';
import { MarkWebJumpAsSyncedCommand as DBMarkWebJumpAsSyncedCommand } from '../../jump-item/web-jump/commands';
import { mapToBTWebJumpUsernameFormatType } from '../../jump-item/web-jump/mappers';
import { WebJump as DBWebJump } from '../../jump-item/web-jump/models';
import { RetrieveWebJumpsQuery as DBRetrieveWebJumpsQuery } from '../../jump-item/web-jump/queries';
import { WebJumpEntity } from '../../jump-item/web-jump/repositories/entities';
import { WebJumpService } from '../../jump-item/web-jump/services/web-jump.service';
import { MarkJumpPolicyAsSyncedCommand as DBMarkJumpPolicyAsSyncedCommand } from '../../jump-policy/commands';
import {
    mapToBTApprovalApproverScopeType,
    mapToBTApprovalScopeType,
    mapToBTSimultaneousJumpsRdpType,
    mapToBTSimultaneousJumpsType,
} from '../../jump-policy/mappers';
import { JumpPolicy as DBJumpPolicy } from '../../jump-policy/models';
import { RetrieveJumpPoliciesQuery as DBRetrieveJumpPoliciesQuery } from '../../jump-policy/queries';
import { JumpPolicyEntity } from '../../jump-policy/repositories/entities';
import { JumpPolicyService } from '../../jump-policy/services/jump-policy.service';
import {
    MarkJumpointAsSyncedCommand as DBMarkJumpointAsSyncedCommand,
    MarkJumpointNodeAsSyncedCommand as DBMarkJumpointNodeAsSyncedCommand,
} from '../../jumpoint/commands';
import { mapToBTJumpointPlatformType, mapToBTJzpClientAddressRestrictionsType } from '../../jumpoint/mappers';
import { Jumpoint as DBJumpoint, JumpointNode as DBJumpointNode } from '../../jumpoint/models';
import {
    RetrieveJumpointNodesQuery as DBRetrieveJumpointNodesQuery,
    RetrieveJumpointsQuery as DBRetrieveJumpointsQuery,
} from '../../jumpoint/queries';
import { JumpointEntity, JumpointNodeEntity } from '../../jumpoint/repositories/entities';
import { JumpointService } from '../../jumpoint/services/jumpoint.service';
import { MarkTeamUserAsSyncedCommand as DBMarkTeamUserAsSyncedCommand } from '../../team-user/commands';
import { TeamUser as DBTeamUser } from '../../team-user/models';
import { RetrieveTeamUsersQuery as DBRetrieveTeamUsersQuery } from '../../team-user/queries';
import { TeamUserEntity } from '../../team-user/repositories/entities';
import { MarkTeamAsSyncedCommand as DBMarkTeamAsSyncedCommand } from '../../team/commands';
import { Team as DBTeam } from '../../team/models';
import { RetrieveTeamsQuery as DBRetrieveTeamsQuery } from '../../team/queries';
import { TeamEntity } from '../../team/repositories/entities';
import { TeamService } from '../../team/services/team.service';
import { MarkUserGroupPolicyAsSyncedCommand as DBMarkUserGroupPolicyAsSyncedCommand } from '../../user-group-policy/commands';
import { UserGroupPolicy as DBUserGroupPolicy } from '../../user-group-policy/models';
import { RetrieveUserGroupPoliciesQuery as DBRetrieveUserGroupPoliciesQuery } from '../../user-group-policy/queries';
import { UserGroupPolicyEntity } from '../../user-group-policy/repositories/entities';
import { MarkUserAsSyncedCommand as DBMarkUserAsSyncedCommand } from '../../user/commands';
import { User as DBUser } from '../../user/models';
import { RetrieveUsersQuery as DBRetrieveUsersQuery } from '../../user/queries';
import { UserEntity } from '../../user/repositories/entities';
import { UserService } from '../../user/services/user.service';
import { DiscrepancyEntityType } from '../enums';
import { DiscrepancyStrategy } from '../types';

@Injectable()
export class DiscrepancyStrategyProviderService {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly groupPolicyService: GroupPolicyService,
        private readonly jumpClientInstallerService: JumpClientInstallerService,
        private readonly jumpClientService: JumpClientService,
        private readonly jumpGroupService: JumpGroupService,
        private readonly jumpPolicyService: JumpPolicyService,
        private readonly jumpointService: JumpointService,
        private readonly protocolTunnelJumpService: ProtocolTunnelJumpService,
        private readonly remoteRdpService: RemoteRdpService,
        private readonly remoteVncService: RemoteVncService,
        private readonly shellJumpService: ShellJumpService,
        private readonly webJumpService: WebJumpService,
        private readonly teamService: TeamService,
        private readonly userService: UserService,
    ) {}

    public get(entityType: DiscrepancyEntityType) {
        if (entityType === DiscrepancyEntityType.GroupPolicy) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveGroupPoliciesQuery, BTGroupPolicy[]>(
                        new BTRetrieveGroupPoliciesQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btCreateFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTCreateGroupPolicyCommand(
                            transactionId,
                            tenantId,
                            entity.name,
                            entity.hasEndpointsAccessPermission,
                            entity.accessPermissionStatusType
                                ? mapToBTAccessPermissionStatusType(entity.accessPermissionStatusType)
                                : undefined,
                            entity.hasShareOtherTeamPermission,
                            entity.hasInviteExternalUserPermission,
                            entity.userSessionIdleTimeoutInSeconds,
                            entity.hasEnableExtendedAvailabilityModePermission,
                            entity.hasEditExternalKeyPermission,
                            entity.hasCollaboratePermission,
                            entity.hasCollaborateControlPermission,
                            entity.hasJumpClientPermission,
                            entity.hasLocalJumpPermission,
                            entity.hasRemoteJumpPermission,
                            entity.hasRemoteVncPermission,
                            entity.hasRemoteRdpPermission,
                            entity.hasShellJumpPermission,
                            entity.hasWebJumpPermission,
                            entity.hasProtocolTunnelPermission,
                            entity.hasSdStaticPortForExternalToolsPermission,
                            entity.defaultJumpItemRoleId,
                            entity.privateJumpItemRoleId,
                            entity.inferiorJumpItemRoleId,
                            entity.unassignedJumpItemRoleId,
                        ),
                    ),
                btModifyFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTModifyGroupPolicyCommand(
                            transactionId,
                            tenantId,
                            entity.id,
                            entity.name,
                            entity.hasEndpointsAccessPermission,
                            entity.accessPermissionStatusType
                                ? mapToBTAccessPermissionStatusType(entity.accessPermissionStatusType)
                                : undefined,
                            entity.hasShareOtherTeamPermission,
                            entity.hasInviteExternalUserPermission,
                            entity.userSessionIdleTimeoutInSeconds,
                            entity.hasEnableExtendedAvailabilityModePermission,
                            entity.hasEditExternalKeyPermission,
                            entity.hasCollaboratePermission,
                            entity.hasCollaborateControlPermission,
                            entity.hasJumpClientPermission,
                            entity.hasLocalJumpPermission,
                            entity.hasRemoteJumpPermission,
                            entity.hasRemoteVncPermission,
                            entity.hasRemoteRdpPermission,
                            entity.hasShellJumpPermission,
                            entity.hasWebJumpPermission,
                            entity.hasProtocolTunnelPermission,
                            entity.hasSdStaticPortForExternalToolsPermission,
                            entity.defaultJumpItemRoleId,
                            entity.privateJumpItemRoleId,
                            entity.inferiorJumpItemRoleId,
                            entity.unassignedJumpItemRoleId,
                        ),
                    ),
                btDeleteFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new BTDeleteGroupPolicyCommand(transactionId, tenantId, id)),
                btToDbEntity: (bt) => GroupPolicyEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveGroupPoliciesQuery, DBGroupPolicy[]>(
                        new DBRetrieveGroupPoliciesQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbCreateOrUpdateFunc: (tenantId, entity) =>
                    this.groupPolicyService.createOrUpdateById(tenantId, entity),
                dbDeleteFunc: (tenantId, id) => this.groupPolicyService.deleteById(tenantId, id),
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
            } as DiscrepancyStrategy<BTGroupPolicy, DBGroupPolicy, GroupPolicyEntity>;
        }

        if (entityType === DiscrepancyEntityType.JumpClientInstaller) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveJumpClientInstallersQuery, BTJumpClientInstaller[]>(
                        new BTRetrieveJumpClientInstallersQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btCreateFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTCreateJumpClientInstallerCommand(
                            transactionId,
                            tenantId,
                            entity.jumpGroupId,
                            entity.name,
                            entity.jumpGroupType,
                            entity.jumpPolicyId,
                            entity.tag,
                            entity.connectionType,
                            entity.sessionPolicyId,
                            entity.comments,
                            undefined, // valid duration is not known.
                            entity.shouldElevateInstall,
                            entity.shouldElevatePrompt,
                            entity.canOverrideJumpGroup,
                            entity.canOverrideJumpPolicy,
                            entity.canOverrideName,
                            entity.canOverrideTag,
                            entity.canOverrideComments,
                            entity.canOverrideSessionPolicy,
                            entity.jumpointProxy,
                        ),
                    ),
                btModifyFunc: (transactionId, tenantId, entity) => {
                    console.log(
                        `No modify operation for Jump Client Installer in BT API. Skipping transaction ${transactionId}, tenant ${tenantId}, entity ID ${entity.id}.`,
                    );

                    return Promise.resolve();
                },
                btDeleteFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new BTDeleteJumpClientInstallerCommand(transactionId, tenantId, id)),
                btToDbEntity: (bt) => JumpClientInstallerEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveJumpClientInstallersQuery, DBJumpClientInstaller[]>(
                        new DBRetrieveJumpClientInstallersQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbCreateOrUpdateFunc: (tenantId, entity) =>
                    this.jumpClientInstallerService.createOrUpdateById(tenantId, entity),
                dbDeleteFunc: (tenantId, id) => this.jumpClientInstallerService.deleteById(tenantId, id),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkJumpClientInstallerAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'keyInfo'],
            } as DiscrepancyStrategy<BTJumpClientInstaller, DBJumpClientInstaller, JumpClientInstallerEntity>;
        }

        if (entityType === DiscrepancyEntityType.JumpClient) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveJumpClientsQuery, BTJumpClient[]>(
                        new BTRetrieveJumpClientsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btCreateFunc: (transactionId, tenantId, entity) => {
                    console.log(
                        `No create operation for Jump Client in BT API. Skipping transaction ${transactionId}, tenant ${tenantId}, entity ID ${entity.id}.`,
                    );

                    return Promise.resolve();
                },
                btModifyFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTModifyJumpClientCommand(
                            transactionId,
                            tenantId,
                            entity.id,
                            entity.jumpGroupId,
                            entity.jumpGroupType ? mapToBTJumpClientGroupType(entity.jumpGroupType) : undefined,
                            entity.name,
                            entity.tag,
                            entity.comments,
                            entity.jumpPolicyId,
                            entity.sessionPolicyId,
                            entity.maxOfflineDurationInMinutes,
                            entity.endpointAgreementPolicyType
                                ? mapToBTJumpClientEndpointAgreementPolicyType(entity.endpointAgreementPolicyType)
                                : undefined,
                        ),
                    ),
                btDeleteFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new BTDeleteJumpClientCommand(transactionId, tenantId, id)),
                btToDbEntity: (bt) => JumpClientEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveJumpClientsQuery, DBJumpClient[]>(
                        new DBRetrieveJumpClientsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbCreateOrUpdateFunc: (tenantId, entity) => this.jumpClientService.createOrUpdateById(tenantId, entity),
                dbDeleteFunc: (tenantId, id) => this.jumpClientService.deleteById(tenantId, id),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkJumpClientAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'expirationDate', 'jumpGroup', 'jumpPolicy'],
            } as DiscrepancyStrategy<BTJumpClient, DBJumpClient, JumpClientEntity>;
        }

        if (entityType === DiscrepancyEntityType.JumpGroup) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveJumpGroupsQuery, BTJumpGroup[]>(
                        new BTRetrieveJumpGroupsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btCreateFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTCreateJumpGroupCommand(
                            transactionId,
                            tenantId,
                            entity.name,
                            entity.codeName,
                            entity.comments,
                        ),
                    ),
                btModifyFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTModifyJumpGroupCommand(
                            transactionId,
                            tenantId,
                            entity.id,
                            entity.name,
                            entity.codeName,
                            entity.comments,
                        ),
                    ),
                btDeleteFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new BTDeleteJumpGroupCommand(transactionId, tenantId, id)),
                btToDbEntity: (bt) => JumpGroupEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveJumpGroupsQuery, DBJumpGroup[]>(
                        new DBRetrieveJumpGroupsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbCreateOrUpdateFunc: (tenantId, entity) => this.jumpGroupService.createOrUpdateById(tenantId, entity),
                dbDeleteFunc: (tenantId, id) => this.jumpGroupService.deleteById(tenantId, id),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkJumpGroupAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate'],
            } as DiscrepancyStrategy<BTJumpGroup, DBJumpGroup, JumpGroupEntity>;
        }

        if (entityType === DiscrepancyEntityType.JumpPolicy) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveJumpPoliciesQuery, BTJumpPolicy[]>(
                        new BTRetrieveJumpPoliciesQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btCreateFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTCreateJumpPolicyCommand(
                            transactionId,
                            tenantId,
                            entity.displayName,
                            entity.codeName,
                            entity.description,
                            entity.hasScheduledAccessRestriction,
                            entity.simultaneousJumpsType
                                ? mapToBTSimultaneousJumpsType(entity.simultaneousJumpsType)
                                : undefined,
                            entity.doesSimultaneousJumpBehaviorApplyToCopies,
                            entity.simultaneousJumpsRdpType
                                ? mapToBTSimultaneousJumpsRdpType(entity.simultaneousJumpsRdpType)
                                : undefined,
                            entity.shouldForceRemoveUsersWhenScheduleDisallows,
                            entity.isTicketIdRequired,
                            entity.isTwoFactorChallengeRequired,
                            entity.isSessionStartNotificationEnabled,
                            entity.isSessionEndNotificationEnabled,
                            entity.notificationEmailAddresses,
                            entity.notificationDisplayName,
                            entity.notificationEmailLanguage,
                            entity.isApprovalRequired,
                            entity.approvalMaxDurationInMinutes,
                            entity.approvalScopeType ? mapToBTApprovalScopeType(entity.approvalScopeType) : undefined,
                            entity.approvalEmailAddresses,
                            entity.approvalUserIds,
                            entity.approvalTeamIds,
                            entity.approvalDisplayName,
                            entity.approvalEmailLanguage,
                            entity.approvalApproverScopeType
                                ? mapToBTApprovalApproverScopeType(entity.approvalApproverScopeType)
                                : undefined,
                            entity.isRecordingsDisabled,
                        ),
                    ),
                btModifyFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTModifyJumpPolicyCommand(
                            transactionId,
                            tenantId,
                            entity.id,
                            entity.displayName,
                            entity.codeName,
                            entity.description,
                            entity.hasScheduledAccessRestriction,
                            entity.simultaneousJumpsType
                                ? mapToBTSimultaneousJumpsType(entity.simultaneousJumpsType)
                                : undefined,
                            entity.doesSimultaneousJumpBehaviorApplyToCopies,
                            entity.simultaneousJumpsRdpType
                                ? mapToBTSimultaneousJumpsRdpType(entity.simultaneousJumpsRdpType)
                                : undefined,
                            entity.shouldForceRemoveUsersWhenScheduleDisallows,
                            entity.isTicketIdRequired,
                            entity.isTwoFactorChallengeRequired,
                            entity.isSessionStartNotificationEnabled,
                            entity.isSessionEndNotificationEnabled,
                            entity.notificationEmailAddresses,
                            entity.notificationDisplayName,
                            entity.notificationEmailLanguage,
                            entity.isApprovalRequired,
                            entity.approvalMaxDurationInMinutes,
                            entity.approvalScopeType ? mapToBTApprovalScopeType(entity.approvalScopeType) : undefined,
                            entity.approvalEmailAddresses,
                            entity.approvalUserIds,
                            entity.approvalTeamIds,
                            entity.approvalDisplayName,
                            entity.approvalEmailLanguage,
                            entity.approvalApproverScopeType
                                ? mapToBTApprovalApproverScopeType(entity.approvalApproverScopeType)
                                : undefined,
                            entity.isRecordingsDisabled,
                        ),
                    ),
                btDeleteFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new BTDeleteJumpPolicyCommand(transactionId, tenantId, id)),
                btToDbEntity: (bt) => JumpPolicyEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveJumpPoliciesQuery, DBJumpPolicy[]>(
                        new DBRetrieveJumpPoliciesQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbCreateOrUpdateFunc: (tenantId, entity) => this.jumpPolicyService.createOrUpdateById(tenantId, entity),
                dbDeleteFunc: (tenantId, id) => this.jumpPolicyService.deleteById(tenantId, id),
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
            } as DiscrepancyStrategy<BTJumpPolicy, DBJumpPolicy, JumpPolicyEntity>;
        }

        if (entityType === DiscrepancyEntityType.Jumpoint) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveJumpointsQuery, BTJumpoint[]>(
                        new BTRetrieveJumpointsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btCreateFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTCreateJumpointCommand(
                            transactionId,
                            tenantId,
                            entity.name,
                            mapToBTJumpointPlatformType(entity.platformType),
                            entity.codeName,
                            entity.comments,
                            entity.isEnabled,
                            entity.isClustered,
                            entity.isShellJumpEnabled,
                            entity.externalJumpItemNetworkId,
                            entity.isProtocolTunnelEnabled,
                            entity.rdpServiceAccountId,
                            entity.managedIpRanges,
                            entity.isJzpEnabled,
                            entity.jzpProxyHostname,
                            entity.jzpProxyPort,
                            entity.isJzpHttpGetAllowed,
                            entity.jzpClientAddressRestrictionsType
                                ? mapToBTJzpClientAddressRestrictionsType(entity.jzpClientAddressRestrictionsType)
                                : undefined,
                            entity.jzpRestrictedIps,
                        ),
                    ),
                btModifyFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTModifyJumpointCommand(
                            transactionId,
                            tenantId,
                            entity.id,
                            entity.name,
                            entity.codeName,
                            entity.comments,
                            entity.isEnabled,
                            entity.isShellJumpEnabled,
                            entity.externalJumpItemNetworkId,
                            entity.isProtocolTunnelEnabled,
                            entity.rdpServiceAccountId,
                            entity.managedIpRanges,
                            entity.isJzpEnabled,
                            entity.jzpProxyHostname,
                            entity.jzpProxyPort,
                            entity.isJzpHttpGetAllowed,
                            entity.jzpClientAddressRestrictionsType
                                ? mapToBTJzpClientAddressRestrictionsType(entity.jzpClientAddressRestrictionsType)
                                : undefined,
                            entity.jzpRestrictedIps,
                        ),
                    ),
                btDeleteFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new BTDeleteJumpointCommand(transactionId, tenantId, id)),
                btOmittedPropsForDuplicateCheck: ['keyInfo'],
                btToDbEntity: (bt) => JumpointEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveJumpointsQuery, DBJumpoint[]>(
                        new DBRetrieveJumpointsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbCreateOrUpdateFunc: (tenantId, entity) => this.jumpointService.createOrUpdateById(tenantId, entity),
                dbDeleteFunc: (tenantId, id) => this.jumpointService.deleteById(tenantId, id),
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
            } as DiscrepancyStrategy<BTJumpoint, DBJumpoint, JumpointEntity>;
        }

        if (entityType === DiscrepancyEntityType.JumpItemProtocolTunnelJump) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveProtocolTunnelJumpsQuery, BTProtocolTunnelJump[]>(
                        new BTRetrieveProtocolTunnelJumpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btCreateFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTCreateProtocolTunnelJumpCommand(
                            transactionId,
                            tenantId,
                            entity.name,
                            entity.jumpointId,
                            entity.hostname,
                            entity.jumpGroupId,
                            entity.jumpGroupType ? mapToBTJumpGroupType(entity.jumpGroupType) : undefined,
                            entity.tag,
                            entity.comments,
                            entity.jumpPolicyId,
                            entity.sessionPolicyId,
                            entity.tunnelListenAddress,
                            entity.tunnelDefinitions,
                            entity.tunnelType ? mapToBTTunnelType(entity.tunnelType) : undefined,
                            entity.username,
                            entity.database,
                            entity.url,
                            entity.caCertificates,
                        ),
                    ),
                btModifyFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTModifyProtocolTunnelJumpCommand(
                            transactionId,
                            tenantId,
                            entity.id,
                            entity.name,
                            entity.jumpointId,
                            entity.hostname,
                            entity.jumpGroupId,
                            entity.jumpGroupType ? mapToBTJumpGroupType(entity.jumpGroupType) : undefined,
                            entity.tag,
                            entity.comments,
                            entity.jumpPolicyId,
                            entity.sessionPolicyId,
                            entity.tunnelListenAddress,
                            entity.tunnelDefinitions,
                            entity.tunnelType ? mapToBTTunnelType(entity.tunnelType) : undefined,
                            entity.username,
                            entity.database,
                            entity.url,
                            entity.caCertificates,
                        ),
                    ),
                btDeleteFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new BTDeleteProtocolTunnelJumpCommand(transactionId, tenantId, id)),
                btToDbEntity: (bt) => ProtocolTunnelJumpEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveProtocolTunnelJumpsQuery, DBProtocolTunnelJump[]>(
                        new DBRetrieveProtocolTunnelJumpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbCreateOrUpdateFunc: (tenantId, entity) =>
                    this.protocolTunnelJumpService.createOrUpdateById(tenantId, entity),
                dbDeleteFunc: (tenantId, id) => this.protocolTunnelJumpService.deleteById(tenantId, id),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkProtocolTunnelJumpAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'jumpoint', 'jumpGroup', 'jumpPolicy'],
            } as DiscrepancyStrategy<BTProtocolTunnelJump, DBProtocolTunnelJump, ProtocolTunnelJumpEntity>;
        }

        if (entityType === DiscrepancyEntityType.JumpItemRemoteRdp) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveRemoteRdpsQuery, BTRemoteRdp[]>(
                        new BTRetrieveRemoteRdpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btCreateFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTCreateRemoteRdpCommand(
                            transactionId,
                            tenantId,
                            entity.name,
                            entity.jumpointId,
                            entity.hostname,
                            entity.jumpGroupId,
                            entity.jumpGroupType ? mapToBTJumpGroupType(entity.jumpGroupType) : undefined,
                            entity.qualityMode ? mapToBTRdpQualityMode(entity.qualityMode) : undefined,
                            entity.mustStartNewConsoleSession,
                            entity.mustIgnoreUntrustedServerCert,
                            entity.tag,
                            entity.comments,
                            entity.rdpUsername,
                            entity.domain,
                            entity.jumpPolicyId,
                            entity.isSessionForensicsEnabled,
                            entity.sessionPolicyId,
                            entity.secureAppType ? mapToBTSecureAppType(entity.secureAppType) : undefined,
                            entity.remoteAppName,
                            entity.remoteAppParams,
                            entity.remoteExePath,
                            entity.remoteExeParams,
                            entity.targetSystem,
                            entity.credentialType,
                        ),
                    ),
                btModifyFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTModifyRemoteRdpCommand(
                            transactionId,
                            tenantId,
                            entity.id,
                            entity.name,
                            entity.jumpointId,
                            entity.hostname,
                            entity.jumpGroupId,
                            entity.jumpGroupType ? mapToBTJumpGroupType(entity.jumpGroupType) : undefined,
                            entity.qualityMode ? mapToBTRdpQualityMode(entity.qualityMode) : undefined,
                            entity.mustStartNewConsoleSession,
                            entity.mustIgnoreUntrustedServerCert,
                            entity.tag,
                            entity.comments,
                            entity.rdpUsername,
                            entity.domain,
                            entity.jumpPolicyId,
                            entity.isSessionForensicsEnabled,
                            entity.sessionPolicyId,
                            entity.secureAppType ? mapToBTSecureAppType(entity.secureAppType) : undefined,
                            entity.remoteAppName,
                            entity.remoteAppParams,
                            entity.remoteExePath,
                            entity.remoteExeParams,
                            entity.targetSystem,
                            entity.credentialType,
                        ),
                    ),
                btDeleteFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new BTDeleteRemoteRdpCommand(transactionId, tenantId, id)),
                btToDbEntity: (bt) => RemoteRdpEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveRemoteRdpsQuery, DBRemoteRdp[]>(
                        new DBRetrieveRemoteRdpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbCreateOrUpdateFunc: (tenantId, entity) => this.remoteRdpService.createOrUpdateById(tenantId, entity),
                dbDeleteFunc: (tenantId, id) => this.remoteRdpService.deleteById(tenantId, id),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkRemoteRdpAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'secureAppType', 'jumpoint', 'jumpGroup', 'jumpPolicy'],
            } as DiscrepancyStrategy<BTRemoteRdp, DBRemoteRdp, RemoteRdpEntity>;
        }

        if (entityType === DiscrepancyEntityType.JumpItemRemoteVnc) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveRemoteVncsQuery, BTRemoteVnc[]>(
                        new BTRetrieveRemoteVncsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btCreateFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTCreateRemoteVncCommand(
                            transactionId,
                            tenantId,
                            entity.name,
                            entity.jumpointId,
                            entity.hostname,
                            entity.port,
                            entity.jumpGroupId,
                            entity.jumpGroupType ? mapToBTJumpGroupType(entity.jumpGroupType) : undefined,
                            entity.tag,
                            entity.comments,
                            entity.jumpPolicyId,
                            entity.sessionPolicyId,
                        ),
                    ),
                btModifyFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTModifyRemoteVncCommand(
                            transactionId,
                            tenantId,
                            entity.id,
                            entity.name,
                            entity.jumpointId,
                            entity.hostname,
                            entity.port,
                            entity.jumpGroupId,
                            entity.jumpGroupType ? mapToBTJumpGroupType(entity.jumpGroupType) : undefined,
                            entity.tag,
                            entity.comments,
                            entity.jumpPolicyId,
                            entity.sessionPolicyId,
                        ),
                    ),
                btDeleteFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new BTDeleteRemoteVncCommand(transactionId, tenantId, id)),
                btToDbEntity: (bt) => RemoteVncEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveRemoteVncsQuery, DBRemoteVnc[]>(
                        new DBRetrieveRemoteVncsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbCreateOrUpdateFunc: (tenantId, entity) => this.remoteVncService.createOrUpdateById(tenantId, entity),
                dbDeleteFunc: (tenantId, id) => this.remoteVncService.deleteById(tenantId, id),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkRemoteVncAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'jumpoint', 'jumpGroup', 'jumpPolicy'],
            } as DiscrepancyStrategy<BTRemoteVnc, DBRemoteVnc, RemoteVncEntity>;
        }

        if (entityType === DiscrepancyEntityType.JumpItemShellJump) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveShellJumpsQuery, BTShellJump[]>(
                        new BTRetrieveShellJumpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btCreateFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTCreateShellJumpCommand(
                            transactionId,
                            tenantId,
                            entity.name,
                            entity.jumpointId,
                            entity.hostname,
                            mapToBTShellJumpProtocolType(entity.protocolType),
                            entity.port,
                            entity.jumpGroupId,
                            entity.jumpGroupType ? mapToBTJumpGroupType(entity.jumpGroupType) : undefined,
                            entity.terminalType ? mapToBTShellJumpTerminalType(entity.terminalType) : undefined,
                            entity.keepAliveIdleSessionInSeconds,
                            entity.tag,
                            entity.comments,
                            entity.jumpPolicyId,
                            entity.username,
                            entity.sessionPolicyId,
                        ),
                    ),
                btModifyFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTModifyShellJumpCommand(
                            transactionId,
                            tenantId,
                            entity.id,
                            entity.name,
                            entity.jumpointId,
                            entity.hostname,
                            entity.protocolType ? mapToBTShellJumpProtocolType(entity.protocolType) : undefined,
                            entity.port,
                            entity.jumpGroupId,
                            entity.jumpGroupType ? mapToBTJumpGroupType(entity.jumpGroupType) : undefined,
                            entity.terminalType ? mapToBTShellJumpTerminalType(entity.terminalType) : undefined,
                            entity.keepAliveIdleSessionInSeconds,
                            entity.tag,
                            entity.comments,
                            entity.jumpPolicyId,
                            entity.username,
                            entity.sessionPolicyId,
                        ),
                    ),
                btDeleteFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new BTDeleteShellJumpCommand(transactionId, tenantId, id)),
                btToDbEntity: (bt) => ShellJumpEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveShellJumpsQuery, DBShellJump[]>(
                        new DBRetrieveShellJumpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbCreateOrUpdateFunc: (tenantId, entity) => this.shellJumpService.createOrUpdateById(tenantId, entity),
                dbDeleteFunc: (tenantId, id) => this.shellJumpService.deleteById(tenantId, id),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkShellJumpAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'jumpoint', 'jumpGroup', 'jumpPolicy'],
            } as DiscrepancyStrategy<BTShellJump, DBShellJump, ShellJumpEntity>;
        }

        if (entityType === DiscrepancyEntityType.JumpItemWebJump) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveWebJumpsQuery, BTWebJump[]>(
                        new BTRetrieveWebJumpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btCreateFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTCreateWebJumpCommand(
                            transactionId,
                            tenantId,
                            entity.name,
                            entity.jumpointId,
                            entity.url,
                            entity.jumpGroupId,
                            entity.jumpGroupType ? mapToBTJumpGroupType(entity.jumpGroupType) : undefined,
                            entity.usernameFormatType
                                ? mapToBTWebJumpUsernameFormatType(entity.usernameFormatType)
                                : undefined,
                            entity.mustVerifyCertificate,
                            entity.authenticationTimeoutInSeconds,
                            entity.tag,
                            entity.comments,
                            entity.jumpPolicyId,
                            entity.usernameField,
                            entity.passwordField,
                            entity.submitField,
                            entity.sessionPolicyId,
                        ),
                    ),
                btModifyFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTModifyWebJumpCommand(
                            transactionId,
                            tenantId,
                            entity.id,
                            entity.name,
                            entity.jumpointId,
                            entity.url,
                            entity.jumpGroupId,
                            entity.jumpGroupType ? mapToBTJumpGroupType(entity.jumpGroupType) : undefined,
                            entity.usernameFormatType
                                ? mapToBTWebJumpUsernameFormatType(entity.usernameFormatType)
                                : undefined,
                            entity.mustVerifyCertificate,
                            entity.authenticationTimeoutInSeconds,
                            entity.tag,
                            entity.comments,
                            entity.jumpPolicyId,
                            entity.usernameField,
                            entity.passwordField,
                            entity.submitField,
                            entity.sessionPolicyId,
                        ),
                    ),
                btDeleteFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new BTDeleteWebJumpCommand(transactionId, tenantId, id)),
                btToDbEntity: (bt) => WebJumpEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveWebJumpsQuery, DBWebJump[]>(
                        new DBRetrieveWebJumpsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbCreateOrUpdateFunc: (tenantId, entity) => this.webJumpService.createOrUpdateById(tenantId, entity),
                dbDeleteFunc: (tenantId, id) => this.webJumpService.deleteById(tenantId, id),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkWebJumpAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'jumpoint', 'jumpGroup', 'jumpPolicy'],
            } as DiscrepancyStrategy<BTWebJump, DBWebJump, WebJumpEntity>;
        }

        if (entityType === DiscrepancyEntityType.Team) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveTeamsQuery, BTTeam[]>(
                        new BTRetrieveTeamsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btCreateFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTCreateTeamCommand(transactionId, tenantId, entity.name, entity.codeName, entity.comments),
                    ),
                btModifyFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTModifyTeamCommand(
                            transactionId,
                            tenantId,
                            entity.id,
                            entity.name,
                            entity.codeName,
                            entity.comments,
                        ),
                    ),
                btDeleteFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new BTDeleteTeamCommand(transactionId, tenantId, id)),
                btToDbEntity: (bt) => TeamEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveTeamsQuery, DBTeam[]>(
                        new DBRetrieveTeamsQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbCreateOrUpdateFunc: (tenantId, entity) => this.teamService.createOrUpdateById(tenantId, entity),
                dbDeleteFunc: (tenantId, id) => this.teamService.deleteById(tenantId, id),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkTeamAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: ['lastSyncDate', 'teamUsers', 'groupPolicyTeams'],
            } as DiscrepancyStrategy<BTTeam, DBTeam, TeamEntity>;
        }

        if (entityType === DiscrepancyEntityType.User) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveUsersQuery, BTUser[]>(
                        new BTRetrieveUsersQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                btCreateFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTCreateUserCommand(
                            transactionId,
                            tenantId,
                            entity.publicDisplayName,
                            entity.username as string,
                            undefined, // Password is unknown.
                            entity.passwordExpirationDate,
                            entity.email,
                            entity.preferredEmailLanguage,
                            entity.isTwoFactorAuthRequired,
                            entity.isLoginAllowed,
                            entity.failedLoginAttempts,
                            entity.mustResetPasswordOnNextLogin,
                        ),
                    ),
                btModifyFunc: (transactionId, tenantId, entity) =>
                    this.commandBus.execute(
                        new BTModifyUserCommand(
                            transactionId,
                            tenantId,
                            entity.id,
                            entity.publicDisplayName,
                            entity.username,
                            undefined, // Password is unknown.
                            entity.passwordExpirationDate,
                            entity.email,
                            entity.preferredEmailLanguage,
                            entity.isTwoFactorAuthRequired,
                            entity.isLoginAllowed,
                            entity.failedLoginAttempts,
                            entity.mustResetPasswordOnNextLogin,
                        ),
                    ),
                btDeleteFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new BTDeleteUserCommand(transactionId, tenantId, id)),
                btToDbEntity: (bt) => UserEntity.createFromBT(bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveUsersQuery, DBUser[]>(
                        new DBRetrieveUsersQuery(transactionId, tenantId, maxBatchSize, pageNumber),
                    ),
                dbCreateOrUpdateFunc: (tenantId, entity) => this.userService.createOrUpdateById(tenantId, entity),
                dbDeleteFunc: (tenantId, id) => this.userService.deleteById(tenantId, id),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkUserAsSyncedCommand(transactionId, tenantId, id)),
                trimmedProps: [
                    'lastSyncDate',
                    'creationDate', // TODO v1 doesn't have date precision of 3, while v2 has. So they always differ.
                    'fido2CredentialCount',
                    'fido2LastUsedDate',
                    'userGroupPolicies',
                    'teamUsers',
                    'groupPolicyMembers',
                ],
            } as DiscrepancyStrategy<BTUser, DBUser, UserEntity>;
        }

        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    public getForRelation(parentId: number, entityType: DiscrepancyEntityType) {
        if (entityType === DiscrepancyEntityType.GroupPolicyJumpGroup) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveGroupPolicyJumpGroupsQuery, BTGroupPolicyJumpGroup[]>(
                        new BTRetrieveGroupPolicyJumpGroupsQuery(
                            transactionId,
                            tenantId,
                            maxBatchSize,
                            pageNumber,
                            parentId,
                        ),
                    ),
                btToDbEntity: (bt) => GroupPolicyJumpGroupEntity.createFromBT(parentId, bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveGroupPolicyJumpGroupsQuery, DBGroupPolicyJumpGroup[]>(
                        new DBRetrieveGroupPolicyJumpGroupsQuery(
                            transactionId,
                            tenantId,
                            maxBatchSize,
                            pageNumber,
                            parentId,
                        ),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(
                        new DBMarkGroupPolicyJumpGroupAsSyncedCommand(transactionId, tenantId, parentId, id),
                    ),
                trimmedProps: ['lastSyncDate', 'groupPolicy', 'jumpGroup'],
                relationalEntityComparisonProps: {
                    parent: 'groupPolicyId',
                    child: 'jumpGroupId',
                },
            } as DiscrepancyStrategy<BTGroupPolicyJumpGroup, DBGroupPolicyJumpGroup, GroupPolicyJumpGroupEntity>;
        }

        if (entityType === DiscrepancyEntityType.GroupPolicyJumpoint) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveGroupPolicyJumpointsQuery, BTGroupPolicyJumpoint[]>(
                        new BTRetrieveGroupPolicyJumpointsQuery(
                            transactionId,
                            tenantId,
                            maxBatchSize,
                            pageNumber,
                            parentId,
                        ),
                    ),
                btToDbEntity: (bt) => GroupPolicyJumpointEntity.createFromBT(parentId, bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveGroupPolicyJumpointsQuery, DBGroupPolicyJumpoint[]>(
                        new DBRetrieveGroupPolicyJumpointsQuery(
                            transactionId,
                            tenantId,
                            maxBatchSize,
                            pageNumber,
                            parentId,
                        ),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(
                        new DBMarkGroupPolicyJumpointAsSyncedCommand(transactionId, tenantId, parentId, id),
                    ),
                trimmedProps: ['lastSyncDate', 'groupPolicy', 'jumpoint'],
                relationalEntityComparisonProps: {
                    parent: 'groupPolicyId',
                    child: 'jumpointId',
                },
            } as DiscrepancyStrategy<BTGroupPolicyJumpoint, DBGroupPolicyJumpoint, GroupPolicyJumpointEntity>;
        }

        if (entityType === DiscrepancyEntityType.GroupPolicyMember) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveGroupPolicyMembersQuery, BTGroupPolicyMember[]>(
                        new BTRetrieveGroupPolicyMembersQuery(
                            transactionId,
                            tenantId,
                            maxBatchSize,
                            pageNumber,
                            parentId,
                        ),
                    ),
                btToDbEntity: (bt) => GroupPolicyMemberEntity.createFromBT(parentId, bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveGroupPolicyMembersQuery, DBGroupPolicyMember[]>(
                        new DBRetrieveGroupPolicyMembersQuery(
                            transactionId,
                            tenantId,
                            maxBatchSize,
                            pageNumber,
                            parentId,
                        ),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(
                        new DBMarkGroupPolicyMemberAsSyncedCommand(transactionId, tenantId, parentId, id),
                    ),
                trimmedProps: ['lastSyncDate', 'groupPolicy', 'user', 'distinguishedName', 'groupName'],
                relationalEntityComparisonProps: {
                    parent: 'groupPolicyId',
                    child: 'memberId',
                },
            } as DiscrepancyStrategy<BTGroupPolicyMember, DBGroupPolicyMember, GroupPolicyMemberEntity>;
        }

        if (entityType === DiscrepancyEntityType.GroupPolicyTeam) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveGroupPolicyTeamsQuery, BTGroupPolicyTeam[]>(
                        new BTRetrieveGroupPolicyTeamsQuery(
                            transactionId,
                            tenantId,
                            maxBatchSize,
                            pageNumber,
                            parentId,
                        ),
                    ),
                btToDbEntity: (bt) => GroupPolicyTeamEntity.createFromBT(parentId, bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveGroupPolicyTeamsQuery, DBGroupPolicyTeam[]>(
                        new DBRetrieveGroupPolicyTeamsQuery(
                            transactionId,
                            tenantId,
                            maxBatchSize,
                            pageNumber,
                            parentId,
                        ),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(
                        new DBMarkGroupPolicyTeamAsSyncedCommand(transactionId, tenantId, parentId, id),
                    ),
                trimmedProps: ['lastSyncDate', 'groupPolicy', 'team'],
                relationalEntityComparisonProps: {
                    parent: 'groupPolicyId',
                    child: 'teamId',
                },
            } as DiscrepancyStrategy<BTGroupPolicyTeam, DBGroupPolicyTeam, GroupPolicyTeamEntity>;
        }

        if (entityType === DiscrepancyEntityType.JumpointNode) {
            return {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                btRetrieveFunc: (transactionId, tenantId, _maxBatchSize, _pageNumber) =>
                    this.queryBus.execute<BTRetrieveJumpointNodesQuery, BTJumpointNode[]>(
                        new BTRetrieveJumpointNodesQuery(transactionId, tenantId, parentId),
                    ),
                btToDbEntity: (bt) => JumpointNodeEntity.createFromBT(parentId, bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveJumpointNodesQuery, DBJumpointNode[]>(
                        new DBRetrieveJumpointNodesQuery(transactionId, tenantId, maxBatchSize, pageNumber, parentId),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(
                        new DBMarkJumpointNodeAsSyncedCommand(transactionId, tenantId, parentId, id),
                    ),
                trimmedProps: ['lastSyncDate', 'jumpoint'],
                relationalEntityComparisonProps: {
                    parent: 'jumpointId',
                    child: 'id',
                },
            } as DiscrepancyStrategy<BTJumpointNode, DBJumpointNode, JumpointNodeEntity>;
        }

        if (entityType === DiscrepancyEntityType.TeamUser) {
            return {
                btRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<BTRetrieveTeamUsersQuery, BTTeamUser[]>(
                        new BTRetrieveTeamUsersQuery(transactionId, tenantId, maxBatchSize, pageNumber, parentId),
                    ),
                btToDbEntity: (bt) => TeamUserEntity.createFromBT(parentId, bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveTeamUsersQuery, DBTeamUser[]>(
                        new DBRetrieveTeamUsersQuery(transactionId, tenantId, maxBatchSize, pageNumber, parentId),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(new DBMarkTeamUserAsSyncedCommand(transactionId, tenantId, parentId, id)),
                trimmedProps: ['lastSyncDate', 'team', 'user'],
                relationalEntityComparisonProps: {
                    parent: 'teamId',
                    child: 'userId',
                },
            } as DiscrepancyStrategy<BTTeamUser, DBTeamUser, TeamUserEntity>;
        }

        if (entityType === DiscrepancyEntityType.UserGroupPolicy) {
            return {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                btRetrieveFunc: (transactionId, tenantId, _maxBatchSize, _pageNumber) =>
                    this.queryBus.execute<BTRetrieveUserGroupPoliciesQuery, BTUserGroupPolicy[]>(
                        new BTRetrieveUserGroupPoliciesQuery(transactionId, tenantId, parentId),
                    ),
                btToDbEntity: (bt) => UserGroupPolicyEntity.createFromBT(parentId, bt),
                dbRetrieveFunc: (transactionId, tenantId, maxBatchSize, pageNumber) =>
                    this.queryBus.execute<DBRetrieveUserGroupPoliciesQuery, DBUserGroupPolicy[]>(
                        new DBRetrieveUserGroupPoliciesQuery(
                            transactionId,
                            tenantId,
                            maxBatchSize,
                            pageNumber,
                            parentId,
                        ),
                    ),
                dbMarkAsSyncedFunc: (transactionId, tenantId, id) =>
                    this.commandBus.execute(
                        new DBMarkUserGroupPolicyAsSyncedCommand(transactionId, tenantId, parentId, id),
                    ),
                trimmedProps: ['lastSyncDate', 'user', 'groupPolicy'],
                relationalEntityComparisonProps: {
                    parent: 'userId',
                    child: 'groupPolicyId',
                },
            } as DiscrepancyStrategy<BTUserGroupPolicy, DBUserGroupPolicy, UserGroupPolicyEntity>;
        }

        throw new Error(`Unsupported entity type: ${entityType}`);
    }
}
