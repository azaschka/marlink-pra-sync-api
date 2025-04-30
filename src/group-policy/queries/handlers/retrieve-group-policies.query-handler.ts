import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { GroupPoliciesRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { RetrieveGroupPoliciesQuery as BTRetrieveGroupPoliciesQuery } from '../../../beyondtrust-pra-conf-api/group-policy/queries';
import { mapFromBTAccessPermissionStatusType } from '../../mappers';
import { GroupPoliciesRetrieved } from '../../models';
import { RetrieveGroupPoliciesQuery } from '../retrieve-group-policies.query';

@QueryHandler(RetrieveGroupPoliciesQuery)
export class RetrieveGroupPoliciesQueryHandler implements IQueryHandler<RetrieveGroupPoliciesQuery> {
    constructor(private readonly queryBus: QueryBus) {}

    public async execute(query: RetrieveGroupPoliciesQuery): Promise<GroupPoliciesRetrieved[]> {
        const groupPolicies = await this.queryBus.execute<
            BTRetrieveGroupPoliciesQuery,
            GroupPoliciesRetrievedDtoOutput[]
        >(new BTRetrieveGroupPoliciesQuery(query.transactionId, query.pageSize, query.pageNumber, query.name));

        return groupPolicies.map((groupPolicy) => ({
            name: groupPolicy.name,
            id: groupPolicy.id,
            hasEndpointsAccessPermission: groupPolicy.permAccessAllowed,
            accessPermissionStatusType: groupPolicy.accessPermStatus
                ? mapFromBTAccessPermissionStatusType(groupPolicy.accessPermStatus)
                : undefined,
            hasShareOtherTeamPermission: groupPolicy.permShareOtherTeam,
            hasInviteExternalUserPermission: groupPolicy.permInviteExternalUser,
            userSessionIdleTimeoutInSeconds: groupPolicy.permSessionIdleTimeout,
            hasEnableExtendedAvailabilityModePermission: groupPolicy.permExtendedAvailabilityModeAllowed,
            hasEditExternalKeyPermission: groupPolicy.permEditExternalKey,
            hasCollaboratePermission: groupPolicy.permCollaborate,
            hasCollaborateControlPermission: groupPolicy.permCollaborateControl,
            hasJumpClientPermission: groupPolicy.permJumpClient,
            hasLocalJumpPermission: groupPolicy.permLocalJump,
            hasRemoteJumpPermission: groupPolicy.permRemoteJump,
            hasRemoteVncPermission: groupPolicy.permRemoteVnc,
            hasRemoteRdpPermission: groupPolicy.permRemoteRdp,
            hasShellJumpPermission: groupPolicy.permShellJump,
            hasWebJumpPermission: groupPolicy.permWebJump,
            hasProtocolTunnelPermission: groupPolicy.permProtocolTunnel,
            hasSdStaticPortForExternalToolsPermission: groupPolicy.permSdStaticPortForExternalTools,
            defaultJumpItemRoleId: groupPolicy.defaultJumpItemRoleId,
            privateJumpItemRoleId: groupPolicy.privateJumpItemRoleId,
            inferiorJumpItemRoleId: groupPolicy.inferiorJumpItemRoleId,
            unassignedJumpItemRoleId: groupPolicy.unassignedJumpItemRoleId,
        }));
    }
}
