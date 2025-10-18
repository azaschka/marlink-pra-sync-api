import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { UserGroupPolicyRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import { RetrieveUserGroupPoliciesQuery as BTRetrieveUserGroupPoliciesQuery } from '../../../beyondtrust-pra-conf-api/user/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { SyncUserGroupPoliciesAfterUsersSyncedCommand } from '../sync-user-group-policies-after-users-synced.command';
import { UserGroupPoliciesSyncedEvent, UserGroupPoliciesSyncFailedEvent } from '../../../user-group-policy/events';
import { UserGroupPolicy } from '../../../user-group-policy/models';
import { UserGroupPolicyEntity } from '../../../user-group-policy/repositories/entities';
import { UserGroupPolicyRepositoryService } from '../../../user-group-policy/repositories/services/user-group-policy-repository.service';

@CommandHandler(SyncUserGroupPoliciesAfterUsersSyncedCommand)
export class SyncUserGroupPoliciesAfterUsersSyncedCommandHandler
    implements ICommandHandler<SyncUserGroupPoliciesAfterUsersSyncedCommand>
{
    constructor(
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly userGroupPolicyRepositoryService: UserGroupPolicyRepositoryService,
    ) {}

    public async execute(command: SyncUserGroupPoliciesAfterUsersSyncedCommand): Promise<void> {
        for (const userId of [...command.createdUserIds, ...command.updatedUserIds]) {
            try {
                const btUserGroupPolicies = await this.retrieveBTUserGroupPolicies(
                    command.transactionId,
                    command.tenantId,
                    userId,
                );
                const userGroupPolicyEntities = this.createUserGroupPolicyEntities(userId, btUserGroupPolicies);
                const userGroupPolicies = await this.replaceUserGroupPolicies(
                    command.tenantId,
                    userId,
                    userGroupPolicyEntities,
                );

                if (userGroupPolicies.length === 0) {
                    continue;
                }

                this.eventBus.publish(
                    new UserGroupPoliciesSyncedEvent(command.transactionId, {
                        userGroupPolicies: userGroupPolicies,
                        tenantId: command.tenantId,
                    }),
                );
            } catch (error) {
                this.eventBus.publish(
                    new UserGroupPoliciesSyncFailedEvent(command.transactionId, {
                        errorMessage: `Failed to sync for user "${userId}": ${ErrorProcessorUtility.stringify(error)}`,
                        tenantId: command.tenantId,
                    }),
                );
            }
        }

        try {
            await this.userGroupPolicyRepositoryService.deleteByUserIds(command.tenantId, command.deletedUserIds);
        } catch (error) {
            this.eventBus.publish(
                new UserGroupPoliciesSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    tenantId: command.tenantId,
                }),
            );
        }
    }

    private async retrieveBTUserGroupPolicies(transactionId: string, tenantId: number, userId: number) {
        return await this.queryBus.execute<BTRetrieveUserGroupPoliciesQuery, UserGroupPolicyRetrievedDtoOutput[]>(
            new BTRetrieveUserGroupPoliciesQuery(transactionId, tenantId, userId),
        );
    }

    private createUserGroupPolicyEntities(userId: number, btUserGroupPolicies: UserGroupPolicyRetrievedDtoOutput[]) {
        return UserGroupPolicyEntity.create(
            userId,
            btUserGroupPolicies.map((policy) => policy.id),
        );
    }

    private async replaceUserGroupPolicies(
        tenantId: number,
        userId: number,
        userGroupPolicyEntities: UserGroupPolicyEntity[],
    ): Promise<UserGroupPolicy[]> {
        // Delete all existing user group policies
        await this.userGroupPolicyRepositoryService.deleteByUserId(tenantId, userId);

        // Recreate the user group policies
        await this.userGroupPolicyRepositoryService.createOrUpdateByUserIdAndGroupPolicyId(
            tenantId,
            userGroupPolicyEntities,
        );

        return userGroupPolicyEntities.map((entity) => ({
            userId: userId,
            groupPolicyId: entity.groupPolicyId,
            lastSyncDate: entity.lastSyncDate,
        }));
    }
}
