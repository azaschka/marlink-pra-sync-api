import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ModifyUserCommand as BTModifyUserCommand } from '../../../beyondtrust-pra-conf-api/user/commands';
import { UserModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UserModificationFailedEvent, UserModifiedEvent } from '../../events';
import {
    mapFromBTUserAllowedAccessPermissionType,
    mapFromBTUserEndpointAutomationPermissionType,
    mapFromBTUserViewSupportReportsPermissionType,
    mapFromBTUserViewVaultReportsPermissionType,
} from '../../mappers';
import { User } from '../../models';
import { UserEntity } from '../../repositories/entities';
import { UserRepositoryService } from '../../repositories/services/user-repository.service';
import { ModifyUserCommand } from '../modify-user.command';

@CommandHandler(ModifyUserCommand)
export class ModifyUserCommandHandler implements ICommandHandler<ModifyUserCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly userRepositoryService: UserRepositoryService,
    ) {}

    public async execute(command: ModifyUserCommand): Promise<User> {
        const btUser = await this.modifyBTUser(command);
        const userEntity = this.createUserEntity(btUser);

        try {
            const updatedUser = await this.updateUser(command.tenantId, userEntity);

            this.eventBus.publish(
                new UserModifiedEvent(command.transactionId, {
                    user: updatedUser,
                    tenantId: command.tenantId,
                }),
            );

            return updatedUser;
        } catch (error) {
            this.eventBus.publish(
                new UserModificationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    user: userEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async modifyBTUser(command: ModifyUserCommand) {
        return await this.commandBus.execute<BTModifyUserCommand, UserModifiedDtoOutput>(
            new BTModifyUserCommand(
                command.transactionId,
                command.id,
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

    private createUserEntity(btUser: UserModifiedDtoOutput) {
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
            btUser.permEndpointAutomation
                ? mapFromBTUserEndpointAutomationPermissionType(btUser.permEndpointAutomation)
                : undefined,
        );
    }

    private async updateUser(tenantId: number, userEntity: UserEntity) {
        await this.userRepositoryService.createOrUpdateById(tenantId, userEntity);

        const createdOrUpdatedUser = await this.userRepositoryService.findOneById(tenantId, userEntity.id);

        if (!createdOrUpdatedUser) {
            throw new Error('User has been created or updated but could not be retrieved.');
        }

        return createdOrUpdatedUser;
    }
}
