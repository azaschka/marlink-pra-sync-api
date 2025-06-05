import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { ModifyUserGroupPoliciesCommand as BTModifyUserGroupPoliciesCommand } from '../../../beyondtrust-pra-conf-api/user/commands';
import {
    UserGroupPoliciesModifiedDtoOutput,
    UserGroupPolicyRetrievedDtoOutput,
} from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import { RetrieveUserGroupPoliciesQuery } from '../../../beyondtrust-pra-conf-api/user/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UserGroupPoliciesModificationFailedEvent, UserGroupPoliciesModifiedEvent } from '../../events';
import { UserGroupPolicies } from '../../models';
import { UserGroupPolicyEntity } from '../../repositories/entities';
import { UserGroupPolicyRepositoryService } from '../../repositories/services/user-group-policy-repository.service';
import { ModifyUserGroupPoliciesCommand } from '../modify-user-group-policies.command';

@CommandHandler(ModifyUserGroupPoliciesCommand)
export class ModifyUserGroupPoliciesCommandHandler implements ICommandHandler<ModifyUserGroupPoliciesCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly userGroupPolicyRepositoryService: UserGroupPolicyRepositoryService,
    ) {}

    public async execute(command: ModifyUserGroupPoliciesCommand): Promise<UserGroupPolicies> {
        const btUserGroupPolicies = await this.modifyBTUserGroupPolicies(command);
        const userGroupPolicyEntities = this.createUserGroupPolicyEntities(command.userId, btUserGroupPolicies);

        try {
            const userGroupPolicies = await this.replaceUserGroupPolicies(command.userId, userGroupPolicyEntities);

            this.eventBus.publish(
                new UserGroupPoliciesModifiedEvent(command.transactionId, {
                    userGroupPolicies: userGroupPolicies,
                }),
            );

            return userGroupPolicies;
        } catch (error) {
            this.eventBus.publish(
                new UserGroupPoliciesModificationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    userId: command.userId,
                    groupPolicyIdsToAdd: command.groupPolicyIdsToAdd,
                    groupPolicyIdsToRemove: command.groupPolicyIdsToRemove,
                }),
            );

            throw error;
        }
    }

    private async modifyBTUserGroupPolicies(command: ModifyUserGroupPoliciesCommand) {
        await this.commandBus.execute<BTModifyUserGroupPoliciesCommand, UserGroupPoliciesModifiedDtoOutput>(
            new BTModifyUserGroupPoliciesCommand(
                command.transactionId,
                command.userId,
                command.groupPolicyIdsToAdd,
                command.groupPolicyIdsToRemove,
            ),
        );

        return await this.queryBus.execute<RetrieveUserGroupPoliciesQuery, UserGroupPolicyRetrievedDtoOutput[]>(
            new RetrieveUserGroupPoliciesQuery(command.transactionId, command.userId),
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
    ): Promise<UserGroupPolicies> {
        // Delete all existing user group policies
        await this.userGroupPolicyRepositoryService.deleteByUserId(userId);

        // Recreate the user group policies
        await this.userGroupPolicyRepositoryService.createOrUpdateByUserIdAndGroupPolicyIds(userGroupPolicyEntities);

        return {
            userId: userId,
            groupPolicyIds: userGroupPolicyEntities.map((policy) => policy.groupPolicyId),
        };
    }
}
