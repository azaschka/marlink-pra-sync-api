import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { UserRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import { RetrieveUsersQuery } from '../../../beyondtrust-pra-conf-api/user/queries';
import { DateUtility, ErrorProcessorUtility, ObjectUtility } from '../../../shared/utilities';
import { UsersSyncedEvent, UsersSyncFailedEvent } from '../../events';
import {
    mapFromBTUserAllowedAccessPermissionType,
    mapFromBTUserViewSupportReportsPermissionType,
    mapFromBTUserViewVaultReportsPermissionType,
} from '../../mappers';
import { UsersSyncResult } from '../../models';
import { UserEntity } from '../../repositories/entities';
import { UserRepositoryService } from '../../repositories/services/user-repository.service';
import { SyncUsersCommand } from '../sync-users.command';

@CommandHandler(SyncUsersCommand)
export class SyncUsersCommandHandler implements ICommandHandler<SyncUsersCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly userRepositoryService: UserRepositoryService,
    ) {}

    public async execute(command: SyncUsersCommand): Promise<UsersSyncResult> {
        try {
            const startSyncUtcDate = DateUtility.getCurrentUtcDate();

            const createdUserIds: number[] = [];
            const updatedUserIds: number[] = [];
            const deletedUserIds: number[] = [];

            await this.syncBTToDbUsersPerPage(
                command.transactionId,
                command.tenantId,
                1,
                createdUserIds,
                updatedUserIds,
            );
            await this.syncDbToBTUsersPerPage(command.tenantId, 1, startSyncUtcDate, deletedUserIds);

            this.eventBus.publish(
                new UsersSyncedEvent(command.transactionId, {
                    createdUserIds,
                    updatedUserIds,
                    deletedUserIds,
                }),
            );

            return {
                createdUserIds,
                updatedUserIds,
                deletedUserIds,
            };
        } catch (error) {
            this.eventBus.publish(
                new UsersSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                }),
            );

            throw error;
        }
    }

    private async syncBTToDbUsersPerPage(
        transactionId: string,
        tenantId: number,
        pageNumber: number,
        createdUserIds: number[],
        updatedUserIds: number[],
    ) {
        // Retrieve users from BeyondTrust
        const btUsers = await this.queryBus.execute<RetrieveUsersQuery, UserRetrievedDtoOutput[]>(
            new RetrieveUsersQuery(transactionId, this.appConfigService.sync.maxBatchSize, pageNumber),
        );

        // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
        if (
            ObjectUtility.contain(
                [...createdUserIds, ...updatedUserIds],
                btUsers.map((user) => user.id),
            )
        ) {
            return;
        }

        // Retrieve existing users from the DB using BeyondTrust user IDs
        const dbUsers = await this.userRepositoryService.findByIds(
            tenantId,
            btUsers.map((user) => user.id).filter((id) => id !== undefined),
        );

        const usersToBeCreated = this.findAllUsersToBeCreated(btUsers, dbUsers);
        const usersToBeUpdated = this.findAllUsersToBeUpdatedOrUpdateLastSyncDate(btUsers, dbUsers);

        if (usersToBeCreated.length > 0) {
            await this.userRepositoryService.createOrUpdateByIds(tenantId, usersToBeCreated);
        }

        if (usersToBeUpdated.length > 0) {
            await this.userRepositoryService.createOrUpdateByIds(tenantId, usersToBeUpdated);
        }

        // Collect created and updated user IDs
        createdUserIds.push(...usersToBeCreated.map((user) => user.id));
        updatedUserIds.push(...usersToBeUpdated.map((user) => user.id));

        if (btUsers.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncBTToDbUsersPerPage(transactionId, tenantId, pageNumber + 1, createdUserIds, updatedUserIds);
    }

    private async syncDbToBTUsersPerPage(
        tenantId: number,
        pageNumber: number,
        dateBeforeSyncingBTUsers: Date,
        deletedUserIds: number[],
    ) {
        const dbUsers = await this.userRepositoryService.findByLastSyncDateBefore(
            tenantId,
            dateBeforeSyncingBTUsers,
            pageNumber,
            this.appConfigService.sync.maxBatchSize,
        );
        const userIds = dbUsers.map((dbUser) => dbUser.id);

        if (userIds.length > 0) {
            await this.userRepositoryService.deleteByIds(tenantId, userIds);
        }

        // Collect deleted user IDs
        deletedUserIds.push(...userIds);

        if (dbUsers.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncDbToBTUsersPerPage(tenantId, pageNumber + 1, dateBeforeSyncingBTUsers, deletedUserIds);
    }

    private findAllUsersToBeCreated(btUsers: UserRetrievedDtoOutput[], dbUsers: UserEntity[]) {
        return btUsers
            .filter((btUser) => !dbUsers.some((dbUser) => dbUser.id === btUser.id))
            .map((btUser) => this.createUserEntity(btUser));
    }

    private findAllUsersToBeUpdatedOrUpdateLastSyncDate(btUsers: UserRetrievedDtoOutput[], dbUsers: UserEntity[]) {
        return btUsers
            .filter((btUser) => dbUsers.find((dbUser) => dbUser.id === btUser.id))
            .map((btUser) => this.createUserEntity(btUser));
    }

    private createUserEntity(btUser: UserRetrievedDtoOutput) {
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
