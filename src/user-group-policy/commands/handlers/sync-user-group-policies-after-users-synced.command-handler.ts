import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { UserGroupPolicyRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import { RetrieveUserGroupPoliciesQuery as BTRetrieveUserGroupPoliciesQuery } from '../../../beyondtrust-pra-conf-api/user/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UserGroupPoliciesSyncedEvent, UserGroupPoliciesSyncFailedEvent } from '../../events';
import { UserGroupPolicy } from '../../models';
import { UserGroupPolicyEntity } from '../../repositories/entities';
import { UserGroupPolicyRepositoryService } from '../../repositories/services/user-group-policy-repository.service';
import { SyncUserGroupPoliciesAfterUsersSyncedCommand } from '../sync-user-group-policies-after-users-synced.command';

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
                const btUserGroupPolicies = await this.retrieveBTUserGroupPolicies(command.transactionId, userId);
                const userGroupPolicyEntities = this.createUserGroupPolicyEntities(userId, btUserGroupPolicies);

                const userGroupPolicies = await this.replaceUserGroupPolicies(userId, userGroupPolicyEntities);

                this.eventBus.publish(
                    new UserGroupPoliciesSyncedEvent(command.transactionId, {
                        userGroupPolicies: userGroupPolicies,
                    }),
                );
            } catch (error) {
                this.eventBus.publish(
                    new UserGroupPoliciesSyncFailedEvent(command.transactionId, {
                        errorMessage: ErrorProcessorUtility.stringify(error),
                    }),
                );
            }
        }

        try {
            await this.userGroupPolicyRepositoryService.deleteByUserIds(command.deletedUserIds);
        } catch (error) {
            this.eventBus.publish(
                new UserGroupPoliciesSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                }),
            );
        }
    }

    private async retrieveBTUserGroupPolicies(transactionId: string, userId: number) {
        return await this.queryBus.execute<BTRetrieveUserGroupPoliciesQuery, UserGroupPolicyRetrievedDtoOutput[]>(
            new BTRetrieveUserGroupPoliciesQuery(transactionId, userId),
        );
    }

    private createUserGroupPolicyEntities(userId: number, btUserGroupPolicies: UserGroupPolicyRetrievedDtoOutput[]) {
        return UserGroupPolicyEntity.create(
            userId,
            btUserGroupPolicies.map((policy) => policy.id),
        );
    }

    private async replaceUserGroupPolicies(
        userId: number,
        userGroupPolicyEntities: UserGroupPolicyEntity[],
    ): Promise<UserGroupPolicy[]> {
        // Delete all existing user group policies
        await this.userGroupPolicyRepositoryService.deleteByUserId(userId);

        // Recreate the user group policies
        await this.userGroupPolicyRepositoryService.createOrUpdateByUserIdAndGroupPolicyId(userGroupPolicyEntities);

        return userGroupPolicyEntities.map((entity) => ({
            userId: userId,
            groupPolicyId: entity.groupPolicyId,
        }));
    }
}
