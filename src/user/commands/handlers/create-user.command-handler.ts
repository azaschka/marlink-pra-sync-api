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
        const user = await this.commandBus.execute<BTCreateUserCommand, UserCreatedDtoOutput>(
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

        this.eventBus.publish(
            new UserCreatedEvent(command.transactionId, {
                publicDisplayName: user.publicDisplayName,
                id: user.id,
                username: user.username,
                email: user.emailAddress,
                creationDate: user.createdAt,
            }),
        );

        return {
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
        };
    }
}
