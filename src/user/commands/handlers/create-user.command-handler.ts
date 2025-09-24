import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand as BTCreateUserCommand } from '../../../beyondtrust-pra-conf-api/user/commands';
import { UserCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UserCreatedEvent, UserCreationFailedEvent } from '../../events';
import {
    mapFromBTUserAllowedAccessPermissionType,
    mapFromBTUserViewSupportReportsPermissionType,
    mapFromBTUserViewVaultReportsPermissionType,
} from '../../mappers';
import { User } from '../../models';
import { UserEntity } from '../../repositories/entities';
import { UserRepositoryService } from '../../repositories/services/user-repository.service';
import { CreateUserCommand } from '../create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly userRepositoryService: UserRepositoryService,
    ) {}

    public async execute(command: CreateUserCommand): Promise<User> {
        const btUser = await this.createBTUser(command);
        const userEntity = this.createUserEntity(btUser);

        try {
            const createdUser = await this.userRepositoryService.create(command.tenantId, userEntity);

            this.eventBus.publish(
                new UserCreatedEvent(command.transactionId, {
                    user: createdUser,
                    tenantId: command.tenantId,
                }),
            );

            return createdUser;
        } catch (error) {
            this.eventBus.publish(
                new UserCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    user: userEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async createBTUser(command: CreateUserCommand) {
        return await this.commandBus.execute<BTCreateUserCommand, UserCreatedDtoOutput>(
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
    }

    private createUserEntity(btUser: UserCreatedDtoOutput) {
        return UserEntity.create(
            btUser.id,
            btUser.publicDisplayName,
            btUser.securityProviderId,
            btUser.username,
            btUser.passwordExpiration,
            btUser.emailAddress,
            btUser.preferredEmailLanguage,
            btUser.twoFactorRequired,
            btUser.enabled,
            btUser.lastAuthentication,
            btUser.failedLogins,
            btUser.passwordResetNextLogin,
            btUser.createdAt,
            btUser.twoFactorEnabled,
            btUser.fido2CredentialCount,
            btUser.fido2LastUsedDate,
            btUser.permAdmin,
            btUser.permSetPasswords,
            btUser.permAdminPushagents,
            btUser.permViewSupportReports
                ? mapFromBTUserViewSupportReportsPermissionType(btUser.permViewSupportReports)
                : undefined,
            btUser.permViewVaultReports
                ? mapFromBTUserViewVaultReportsPermissionType(btUser.permViewVaultReports)
                : undefined,
            btUser.permViewSyslogReports,
            btUser.permViewSdRecordings,
            btUser.permEditJumpGroups,
            btUser.permEditSdTeams,
            btUser.permEditCannedScripts,
            btUser.permEditCustomRepLinks,
            btUser.permAccessAllowed ? mapFromBTUserAllowedAccessPermissionType(btUser.permAccessAllowed) : undefined,
            btUser.permShareOtherTeam,
            btUser.permInviteExternalUser,
            btUser.permExtendedAvailabilityModeAllowed,
            btUser.permEditExternalKey,
            btUser.permSessionIdleTimeout,
            btUser.permCollaborate,
            btUser.permCollaborateControl,
            btUser.permJumpClient,
            btUser.permLocalJump,
            btUser.permRemoteJump,
            btUser.permRemoteVnc,
            btUser.permRemoteRdp,
            btUser.permShellJump,
            btUser.defaultJumpItemRoleId,
            btUser.privateJumpItemRoleId,
            btUser.inferiorJumpItemRoleId,
            btUser.unassignedJumpItemRoleId,
            btUser.permWebJump,
            btUser.permProtocolTunnel,
            btUser.permSdStaticPortForExternalTools,
            btUser.permVault,
            btUser.permEndpointAutomation,
        );
    }
}
