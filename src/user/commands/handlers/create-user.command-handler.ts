import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand as BTCreateUserCommand } from '../../../beyondtrust-pra-conf-api/user/commands';
import { UserCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import { UserCreatedEvent } from '../../events';
import {
    mapFromBTUserAllowedAccessPermissionType,
    mapFromBTUserViewSupportReportsPermissionType,
    mapFromBTUserViewVaultReportsPermissionType,
} from '../../mappers';
import { UserCreated } from '../../models';
import { CreateUserCommand } from '../create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
    ) {}

    public async execute(command: CreateUserCommand): Promise<UserCreated> {
        const btUser = await this.commandBus.execute<BTCreateUserCommand, UserCreatedDtoOutput>(
            new BTCreateUserCommand(
                command.transactionId,
                command.publicDisplayName,
                command.username,
                command.password,
                command.passwordExpirationDate,
                command.email,
                command.preferredEmailLanguage,
                command.isTwoFactorAuthRequired,
                command.isLoginAllowed,
                command.failedLoginAttempts,
                command.mustResetPasswordOnNextLogin,
            ),
        );

        const user: UserCreated = {
            publicDisplayName: btUser.publicDisplayName,
            id: btUser.id,
            securityProviderId: btUser.securityProviderId,
            username: btUser.username,
            passwordExpirationDate: btUser.passwordExpiration,
            email: btUser.emailAddress,
            preferredEmailLanguage: btUser.preferredEmailLanguage,
            isTwoFactorAuthRequired: btUser.twoFactorRequired,
            isLoginAllowed: btUser.enabled,
            lastAuthenticationDate: btUser.lastAuthentication,
            failedLoginAttempts: btUser.failedLogins,
            mustResetPasswordOnNextLogin: btUser.passwordResetNextLogin,
            creationDate: btUser.createdAt,
            hasTwoFactorAuthEnabled: btUser.twoFactorEnabled,
            fido2CredentialCount: btUser.fido2CredentialCount,
            fido2LastUsedDate: btUser.fido2LastUsedDate,
            hasAdminPermission: btUser.permAdmin,
            hasSetPasswordsPermission: btUser.permSetPasswords,
            hasAdminPushagentPermission: btUser.permAdminPushagents,
            viewSupportReportsPermissionType: btUser.permViewSupportReports
                ? mapFromBTUserViewSupportReportsPermissionType(btUser.permViewSupportReports)
                : undefined,
            viewVaultReportsPermissionType: btUser.permViewVaultReports
                ? mapFromBTUserViewVaultReportsPermissionType(btUser.permViewVaultReports)
                : undefined,
            hasViewSyslogReportsPermission: btUser.permViewSyslogReports,
            hasViewSdRecordingsPermission: btUser.permViewSdRecordings,
            hasEditJumpGroupsPermission: btUser.permEditJumpGroups,
            hasEditSdTeamsPermission: btUser.permEditSdTeams,
            hasEditCannedScriptsPermission: btUser.permEditCannedScripts,
            hasEditCustomRepLinksPermission: btUser.permEditCustomRepLinks,
            allowedAccessPermissionType: btUser.permAccessAllowed
                ? mapFromBTUserAllowedAccessPermissionType(btUser.permAccessAllowed)
                : undefined,
            hasShareOtherTeamPermission: btUser.permShareOtherTeam,
            hasInviteExternalUserPermission: btUser.permInviteExternalUser,
            hasExtendedAvailabilityModeAllowedPermission: btUser.permExtendedAvailabilityModeAllowed,
            hasEditExternalKeyPermission: btUser.permEditExternalKey,
            hasSessionIdleTimeoutPermission: btUser.permSessionIdleTimeout,
            hasCollaboratePermission: btUser.permCollaborate,
            hasCollaborateControlPermission: btUser.permCollaborateControl,
            hasJumpClientPermission: btUser.permJumpClient,
            hasLocalJumpPermission: btUser.permLocalJump,
            hasRemoteJumpPermission: btUser.permRemoteJump,
            hasRemoteVncPermission: btUser.permRemoteVnc,
            hasRemoteRdpPermission: btUser.permRemoteRdp,
            hasShellJumpPermission: btUser.permShellJump,
            defaultJumpItemRoleId: btUser.defaultJumpItemRoleId,
            privateJumpItemRoleId: btUser.privateJumpItemRoleId,
            inferiorJumpItemRoleId: btUser.inferiorJumpItemRoleId,
            unassignedJumpItemRoleId: btUser.unassignedJumpItemRoleId,
            hasWebJumpPermission: btUser.permWebJump,
            hasProtocolTunnelPermission: btUser.permProtocolTunnel,
            hasSdStaticPortForExternalToolsPermission: btUser.permSdStaticPortForExternalTools,
            hasVaultPermission: btUser.permVault,
            hasEndpointAutomationPermission: btUser.permEndpointAutomation,
        };

        this.eventBus.publish(new UserCreatedEvent(command.transactionId, user));

        return user;
    }
}
