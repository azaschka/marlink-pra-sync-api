import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand as BTCreateUserCommand } from '../../../beyondtrust-pra-conf-api/user/commands';
import { UserCreatedDtoOutput, UserRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import { RetrieveUsersQuery as BTRetrieveUsersQuery } from '../../../beyondtrust-pra-conf-api/user/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UserCreatedEvent, UserCreationFailedEvent } from '../../events';
import {
    mapFromBTUserAllowedAccessPermissionType,
    mapFromBTUserEndpointAutomationPermissionType,
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
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly userRepositoryService: UserRepositoryService,
    ) {}

    public async execute(command: CreateUserCommand): Promise<User> {
        const { btUser, existedInBeyondTrust } = await this.getOrCreateBTUser(command);
        const userEntity = this.createUserEntity(btUser);

        try {
            let savedUser: User;

            if (existedInBeyondTrust) {
                // User already existed in BeyondTrust but was missing from the local sync DB.
                // Use upsert to heal the sync DB and avoid a duplicate-key error.
                await this.userRepositoryService.createOrUpdateById(command.tenantId, userEntity);
                savedUser = userEntity;
            } else {
                savedUser = await this.userRepositoryService.create(command.tenantId, userEntity);
            }

            this.eventBus.publish(
                new UserCreatedEvent(command.transactionId, {
                    user: savedUser,
                    tenantId: command.tenantId,
                }),
            );

            return savedUser;
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

    /**
     * Attempts to create the user in BeyondTrust.
     * If BeyondTrust rejects with 422 "already been taken" on any field, the existing user is
     * fetched by username instead. This ensures true idempotency even when the local sync DB is
     * out of sync with BeyondTrust (e.g. after a DB reset or before the first discrepancy scan
     * has run).
     */
    private async getOrCreateBTUser(
        command: CreateUserCommand,
    ): Promise<{ btUser: UserCreatedDtoOutput; existedInBeyondTrust: boolean }> {
        try {
            const btUser = await this.createBTUser(command);
            return { btUser, existedInBeyondTrust: false };
        } catch (error) {
            if (ErrorProcessorUtility.isBeyondTrustUnprocessableEntityError(error)) {
                console.warn(
                    `[${command.transactionId}] User "${command.username}" already exists in BeyondTrust ` +
                        `(tenant: ${command.tenantId}). Fetching existing user to ensure idempotency.`,
                );

                const existing = await this.fetchExistingBTUserByUsername(
                    command.transactionId,
                    command.tenantId,
                    command.username,
                );

                if (existing) {
                    // UserRetrievedDtoOutput has an identical structure to UserCreatedDtoOutput;
                    // casting is safe here.
                    return {
                        btUser: existing as unknown as UserCreatedDtoOutput,
                        existedInBeyondTrust: true,
                    };
                }
            }

            throw error;
        }
    }

    /**
     * Fetches the first user from BeyondTrust that matches the given username.
     */
    private async fetchExistingBTUserByUsername(
        transactionId: string,
        tenantId: number,
        username: string,
    ): Promise<UserRetrievedDtoOutput | null> {
        const users = await this.queryBus.execute<BTRetrieveUsersQuery, UserRetrievedDtoOutput[]>(
            new BTRetrieveUsersQuery(transactionId, tenantId, 1, 1, undefined, username),
        );
        return users[0] ?? null;
    }

    private async createBTUser(command: CreateUserCommand) {
        return await this.commandBus.execute<BTCreateUserCommand, UserCreatedDtoOutput>(
            new BTCreateUserCommand(
                command.transactionId,
                command.tenantId,
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
            btUser.permEndpointAutomation
                ? mapFromBTUserEndpointAutomationPermissionType(btUser.permEndpointAutomation)
                : undefined,
        );
    }
}
