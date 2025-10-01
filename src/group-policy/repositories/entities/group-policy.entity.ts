import { GroupPolicyJumpGroupEntity } from '../../../group-policy-jump-group/repositories/entities';
import { GroupPolicyJumpointEntity } from '../../../group-policy-jumpoint/repositories/entities';
import { GroupPolicyMemberEntity } from '../../../group-policy-member/repositories/entities';
import { GroupPolicyTeamEntity } from '../../../group-policy-team/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { UserGroupPolicyEntity } from '../../../user-group-policy/repositories/entities';
import { AccessPermissionStatusType } from '../../enums';
import { GroupPolicy } from '../../models';

export class GroupPolicyEntity implements GroupPolicy {
    public id!: number;
    public name!: string;
    public hasEndpointsAccessPermission?: boolean;
    public accessPermissionStatusType?: AccessPermissionStatusType;
    public hasShareOtherTeamPermission?: boolean;
    public hasInviteExternalUserPermission?: boolean;
    public userSessionIdleTimeoutInSeconds?: number;
    public hasEnableExtendedAvailabilityModePermission?: boolean;
    public hasEditExternalKeyPermission?: boolean;
    public hasCollaboratePermission?: boolean;
    public hasCollaborateControlPermission?: boolean;
    public hasJumpClientPermission?: boolean;
    public hasLocalJumpPermission?: boolean;
    public hasRemoteJumpPermission?: boolean;
    public hasRemoteVncPermission?: boolean;
    public hasRemoteRdpPermission?: boolean;
    public hasShellJumpPermission?: boolean;
    public hasWebJumpPermission?: boolean;
    public hasProtocolTunnelPermission?: boolean;
    public hasSdStaticPortForExternalToolsPermission?: boolean;
    public defaultJumpItemRoleId?: number;
    public privateJumpItemRoleId?: number;
    public inferiorJumpItemRoleId?: number;
    public unassignedJumpItemRoleId?: number;
    public lastSyncDate!: Date;
    public userGroupPolicies?: UserGroupPolicyEntity[];
    public groupPolicyJumpoints?: GroupPolicyJumpointEntity[];
    public groupPolicyJumpGroups?: GroupPolicyJumpGroupEntity[];
    public groupPolicyMembers?: GroupPolicyMemberEntity[];
    public groupPolicyTeams?: GroupPolicyTeamEntity[];

    public static create(
        id: number,
        name: string,
        hasEndpointsAccessPermission?: boolean,
        accessPermissionStatusType?: AccessPermissionStatusType,
        hasShareOtherTeamPermission?: boolean,
        hasInviteExternalUserPermission?: boolean,
        userSessionIdleTimeoutInSeconds?: number,
        hasEnableExtendedAvailabilityModePermission?: boolean,
        hasEditExternalKeyPermission?: boolean,
        hasCollaboratePermission?: boolean,
        hasCollaborateControlPermission?: boolean,
        hasJumpClientPermission?: boolean,
        hasLocalJumpPermission?: boolean,
        hasRemoteJumpPermission?: boolean,
        hasRemoteVncPermission?: boolean,
        hasRemoteRdpPermission?: boolean,
        hasShellJumpPermission?: boolean,
        hasWebJumpPermission?: boolean,
        hasProtocolTunnelPermission?: boolean,
        hasSdStaticPortForExternalToolsPermission?: boolean,
        defaultJumpItemRoleId?: number,
        privateJumpItemRoleId?: number,
        inferiorJumpItemRoleId?: number,
        unassignedJumpItemRoleId?: number,
    ): GroupPolicyEntity {
        const entity = new GroupPolicyEntity();
        entity.id = id;
        entity.name = name;
        entity.hasEndpointsAccessPermission = hasEndpointsAccessPermission;
        entity.accessPermissionStatusType = accessPermissionStatusType;
        entity.hasShareOtherTeamPermission = hasShareOtherTeamPermission;
        entity.hasInviteExternalUserPermission = hasInviteExternalUserPermission;
        entity.userSessionIdleTimeoutInSeconds = userSessionIdleTimeoutInSeconds;
        entity.hasEnableExtendedAvailabilityModePermission = hasEnableExtendedAvailabilityModePermission;
        entity.hasEditExternalKeyPermission = hasEditExternalKeyPermission;
        entity.hasCollaboratePermission = hasCollaboratePermission;
        entity.hasCollaborateControlPermission = hasCollaborateControlPermission;
        entity.hasJumpClientPermission = hasJumpClientPermission;
        entity.hasLocalJumpPermission = hasLocalJumpPermission;
        entity.hasRemoteJumpPermission = hasRemoteJumpPermission;
        entity.hasRemoteVncPermission = hasRemoteVncPermission;
        entity.hasRemoteRdpPermission = hasRemoteRdpPermission;
        entity.hasShellJumpPermission = hasShellJumpPermission;
        entity.hasWebJumpPermission = hasWebJumpPermission;
        entity.hasProtocolTunnelPermission = hasProtocolTunnelPermission;
        entity.hasSdStaticPortForExternalToolsPermission = hasSdStaticPortForExternalToolsPermission;
        entity.defaultJumpItemRoleId = defaultJumpItemRoleId;
        entity.privateJumpItemRoleId = privateJumpItemRoleId;
        entity.inferiorJumpItemRoleId = inferiorJumpItemRoleId;
        entity.unassignedJumpItemRoleId = unassignedJumpItemRoleId;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
