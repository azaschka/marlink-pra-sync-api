import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GroupPolicyJumpGroupRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { RetrieveAllGroupPolicyJumpGroupsQuery as BTRetrieveAllGroupPolicyJumpGroupsQuery } from '../../../beyondtrust-pra-conf-api/group-policy/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyJumpGroupsSyncedEvent, GroupPolicyJumpGroupsSyncFailedEvent } from '../../events';
import { GroupPolicyJumpGroup } from '../../models';
import { GroupPolicyJumpGroupEntity } from '../../repositories/entities';
import { GroupPolicyJumpGroupRepositoryService } from '../../repositories/services/group-policy-jump-group-repository.service';
import { SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommand } from '../sync-group-policy-jump-groups-after-group-policies-synced.command';

@CommandHandler(SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommand)
export class SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommandHandler
    implements ICommandHandler<SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommand>
{
    constructor(
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyJumpGroupRepositoryService: GroupPolicyJumpGroupRepositoryService,
    ) {}

    public async execute(command: SyncGroupPolicyJumpGroupsAfterGroupPoliciesSyncedCommand): Promise<void> {
        for (const groupPolicyId of [...command.createdGroupPolicyIds, ...command.updatedGroupPolicyIds]) {
            try {
                const btGroupPolicyJumpGroups = await this.retrieveAllBTGroupPolicyJumpGroups(
                    command.transactionId,
                    groupPolicyId,
                );
                const groupPolicyJumpGroupEntities = this.createGroupPolicyJumpGroupEntities(
                    groupPolicyId,
                    btGroupPolicyJumpGroups,
                );
                const groupPolicyJumpGroups = await this.replaceGroupPolicyJumpGroups(
                    groupPolicyId,
                    groupPolicyJumpGroupEntities,
                );

                this.eventBus.publish(
                    new GroupPolicyJumpGroupsSyncedEvent(command.transactionId, {
                        groupPolicyJumpGroups: groupPolicyJumpGroups,
                    }),
                );
            } catch (error) {
                this.eventBus.publish(
                    new GroupPolicyJumpGroupsSyncFailedEvent(command.transactionId, {
                        errorMessage: ErrorProcessorUtility.stringify(error),
                    }),
                );
            }
        }

        try {
            await this.groupPolicyJumpGroupRepositoryService.deleteByGroupPolicyIds(command.deletedGroupPolicyIds);
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyJumpGroupsSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                }),
            );
        }
    }

    private async retrieveAllBTGroupPolicyJumpGroups(transactionId: string, groupPolicyId: number) {
        return await this.queryBus.execute<
            BTRetrieveAllGroupPolicyJumpGroupsQuery,
            GroupPolicyJumpGroupRetrievedDtoOutput[]
        >(new BTRetrieveAllGroupPolicyJumpGroupsQuery(transactionId, groupPolicyId));
    }

    private createGroupPolicyJumpGroupEntities(
        groupPolicyId: number,
        btGroupPolicyJumpGroups: GroupPolicyJumpGroupRetrievedDtoOutput[],
    ) {
        return btGroupPolicyJumpGroups.map((groupPolicyJumpGroup) =>
            GroupPolicyJumpGroupEntity.create(
                groupPolicyId,
                groupPolicyJumpGroup.jumpGroupId,
                groupPolicyJumpGroup.jumpItemRoleId,
                groupPolicyJumpGroup.jumpPolicyId,
            ),
        );
    }

    private async replaceGroupPolicyJumpGroups(
        groupPolicyId: number,
        groupPolicyJumpGroupEntities: GroupPolicyJumpGroupEntity[],
    ): Promise<GroupPolicyJumpGroup[]> {
        // Delete all existing group policy jump groups
        await this.groupPolicyJumpGroupRepositoryService.deleteByGroupPolicyId(groupPolicyId);

        // Recreate the group policy jump groups
        await this.groupPolicyJumpGroupRepositoryService.createOrUpdateByGroupPolicyIdAndJumpGroupId(
            groupPolicyJumpGroupEntities,
        );

        return groupPolicyJumpGroupEntities.map((entity) => {
            return {
                groupPolicyId: entity.groupPolicyId,
                jumpGroupId: entity.jumpGroupId,
                jumpItemRoleId: entity.jumpItemRoleId,
                jumpPolicyId: entity.jumpPolicyId,
            };
        });
    }
}
