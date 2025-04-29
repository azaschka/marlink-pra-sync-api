import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { UserRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import { RetrieveUsersQuery as BTRetrieveUsersQuery } from '../../../beyondtrust-pra-conf-api/user/queries/retrieve-users.query';
import {
    mapFromBTUserAllowedAccessPermissionType,
    mapFromBTUserViewSupportReportsPermissionType,
    mapFromBTUserViewVaultReportsPermissionType,
} from '../../mappers';
import { UserRetrieved } from '../../models';
import { RetrieveUsersQuery } from '../retrieve-users.query';

@QueryHandler(RetrieveUsersQuery)
export class RetrieveUsersQueryHandler implements IQueryHandler<RetrieveUsersQuery> {
    constructor(private readonly queryBus: QueryBus) {}

    public async execute(query: RetrieveUsersQuery): Promise<UserRetrieved[]> {
        const users = await this.queryBus.execute<BTRetrieveUsersQuery, UserRetrievedDtoOutput[]>(
            new BTRetrieveUsersQuery(
                query.transactionId,
                query.pageSize,
                query.pageNumber,
                query.securityProviderId,
                query.username,
                query.email,
            ),
        );

        return users.map((user) => ({
            publicDisplayName: user.publicDisplayName,
            id: user.id,
            securityProviderId: user.securityProviderId,
            username: user.username,
            passwordExpirationDate: user.passwordExpiration,
            email: user.emailAddress,
            preferredEmailLanguage: user.preferredEmailLanguage,
            isTwoFactorAuthRequired: user.twoFactorRequired,
            isLoginAllowed: user.enabled,
            lastAuthenticationDate: user.lastAuthentication,
            failedLoginAttempts: user.failedLogins,
            mustResetPasswordOnNextLogin: user.passwordResetNextLogin,
            creationDate: user.createdAt,
            hasTwoFactorAuthEnabled: user.twoFactorEnabled,
            fido2CredentialCount: user.fido2CredentialCount,
            fido2LastUsedDate: user.fido2LastUsedDate,
            hasAdminPermission: user.permAdmin,
            hasSetPasswordsPermission: user.permSetPasswords,
            hasAdminPushagentPermission: user.permAdminPushagents,
            viewSupportReportsPermissionType: user.permViewSupportReports
                ? mapFromBTUserViewSupportReportsPermissionType(user.permViewSupportReports)
                : undefined,
            viewVaultReportsPermissionType: user.permViewVaultReports
                ? mapFromBTUserViewVaultReportsPermissionType(user.permViewVaultReports)
                : undefined,
            hasViewSyslogReportsPermission: user.permViewSyslogReports,
            hasViewSdRecordingsPermission: user.permViewSdRecordings,
            hasEditJumpGroupsPermission: user.permEditJumpGroups,
            hasEditSdTeamsPermission: user.permEditSdTeams,
            hasEditCannedScriptsPermission: user.permEditCannedScripts,
            hasEditCustomRepLinksPermission: user.permEditCustomRepLinks,
            allowedAccessPermissionType: user.permAccessAllowed
                ? mapFromBTUserAllowedAccessPermissionType(user.permAccessAllowed)
                : undefined,
            hasShareOtherTeamPermission: user.permShareOtherTeam,
            hasInviteExternalUserPermission: user.permInviteExternalUser,
            hasExtendedAvailabilityModeAllowedPermission: user.permExtendedAvailabilityModeAllowed,
            hasEditExternalKeyPermission: user.permEditExternalKey,
            hasSessionIdleTimeoutPermission: user.permSessionIdleTimeout,
            hasCollaboratePermission: user.permCollaborate,
            hasCollaborateControlPermission: user.permCollaborateControl,
            hasJumpClientPermission: user.permJumpClient,
            hasLocalJumpPermission: user.permLocalJump,
            hasRemoteJumpPermission: user.permRemoteJump,
            hasRemoteVncPermission: user.permRemoteVnc,
            hasRemoteRdpPermission: user.permRemoteRdp,
            hasShellJumpPermission: user.permShellJump,
            defaultJumpItemRoleId: user.defaultJumpItemRoleId,
            privateJumpItemRoleId: user.privateJumpItemRoleId,
            inferiorJumpItemRoleId: user.inferiorJumpItemRoleId,
            unassignedJumpItemRoleId: user.unassignedJumpItemRoleId,
            hasWebJumpPermission: user.permWebJump,
            hasProtocolTunnelPermission: user.permProtocolTunnel,
            hasSdStaticPortForExternalToolsPermission: user.permSdStaticPortForExternalTools,
            hasVaultPermission: user.permVault,
            hasEndpointAutomationPermission: user.permEndpointAutomation,
        }));
    }
}
