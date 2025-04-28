import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveUsersDtoInput } from '../../dtos/inputs';
import { UserRetrievedDtoOutput } from '../../dtos/outputs';
import { UserRetrieved } from '../../models';
import { RetrieveUsersQuery } from '../retrieve-users.query';

@QueryHandler(RetrieveUsersQuery)
export class RetrieveUsersQueryHandler implements IQueryHandler<RetrieveUsersQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveUsersQuery): Promise<UserRetrieved[]> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.path.user,
        );
        const result = await this.httpClientService.get<UserRetrievedDtoOutput, UserRetrievedDtoOutput[]>(
            UserRetrievedDtoOutput,
            url,
            {
                ...RetrieveUsersDtoInput.create(
                    query.pageSize,
                    query.pageNumber,
                    query.securityProviderId,
                    query.username,
                    query.email,
                ),
            },
        );

        return result.map(
            (user) =>
                <UserRetrieved>{
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
                    viewSupportReportsPermissionType: user.permViewSupportReports,
                    viewVaultReportsPermissionType: user.permViewVaultReports,
                    hasViewSyslogReportsPermission: user.permViewSyslogReports,
                    hasViewSdRecordingsPermission: user.permViewSdRecordings,
                    hasEditJumpGroupsPermission: user.permEditJumpGroups,
                    hasEditSdTeamsPermission: user.permEditSdTeams,
                    hasEditCannedScriptsPermission: user.permEditCannedScripts,
                    hasEditCustomRepLinksPermission: user.permEditCustomRepLinks,
                    allowedAccessPermissionType: user.permAccessAllowed,
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
                },
        );
    }
}
