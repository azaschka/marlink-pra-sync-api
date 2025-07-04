import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GroupPolicyMemberRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { RetrieveAllGroupPolicyMembersQuery as BTRetrieveAllGroupPolicyMembersQuery } from '../../../beyondtrust-pra-conf-api/group-policy/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyMembersSyncedEvent, GroupPolicyMembersSyncFailedEvent } from '../../events';
import { GroupPolicyMember } from '../../models';
import { GroupPolicyMemberEntity } from '../../repositories/entities';
import { GroupPolicyMemberRepositoryService } from '../../repositories/services/group-policy-member-repository.service';
import { SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommand } from '../sync-group-policy-members-after-group-policies-synced.command';

@CommandHandler(SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommand)
export class SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommandHandler
    implements ICommandHandler<SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommand>
{
    constructor(
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService,
    ) {}

    public async execute(command: SyncGroupPolicyMembersAfterGroupPoliciesSyncedCommand): Promise<void> {
        for (const groupPolicyId of [...command.createdGroupPolicyIds, ...command.updatedGroupPolicyIds]) {
            try {
                const btGroupPolicyMembers = await this.retrieveAllBTGroupPolicyMembers(
                    command.transactionId,
                    groupPolicyId,
                );
                const groupPolicyMemberEntities = this.createGroupPolicyMemberEntities(
                    groupPolicyId,
                    btGroupPolicyMembers,
                );
                const groupPolicyMembers = await this.replaceGroupPolicyMembers(
                    groupPolicyId,
                    groupPolicyMemberEntities,
                );

                this.eventBus.publish(
                    new GroupPolicyMembersSyncedEvent(command.transactionId, {
                        groupPolicyMembers: groupPolicyMembers,
                    }),
                );
            } catch (error) {
                this.eventBus.publish(
                    new GroupPolicyMembersSyncFailedEvent(command.transactionId, {
                        errorMessage: ErrorProcessorUtility.stringify(error),
                    }),
                );
            }
        }

        try {
            await this.groupPolicyMemberRepositoryService.deleteByGroupPolicyIds(command.deletedGroupPolicyIds);
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyMembersSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                }),
            );
        }
    }

    private async retrieveAllBTGroupPolicyMembers(transactionId: string, groupPolicyId: number) {
        return await this.queryBus.execute<BTRetrieveAllGroupPolicyMembersQuery, GroupPolicyMemberRetrievedDtoOutput[]>(
            new BTRetrieveAllGroupPolicyMembersQuery(transactionId, groupPolicyId),
        );
    }

    private createGroupPolicyMemberEntities(
        groupPolicyId: number,
        btGroupPolicyMembers: GroupPolicyMemberRetrievedDtoOutput[],
    ) {
        return btGroupPolicyMembers.map((groupPolicyMember) =>
            GroupPolicyMemberEntity.create(
                groupPolicyId,
                groupPolicyMember.id,
                groupPolicyMember.userId,
                groupPolicyMember.securityProviderId,
                groupPolicyMember.distinguishedName,
                groupPolicyMember.groupName,
            ),
        );
    }

    private async replaceGroupPolicyMembers(
        groupPolicyId: number,
        groupPolicyMemberEntities: GroupPolicyMemberEntity[],
    ): Promise<GroupPolicyMember[]> {
        // Delete all existing group policy members
        await this.groupPolicyMemberRepositoryService.deleteByGroupPolicyId(groupPolicyId);

        // Recreate the group policy members
        await this.groupPolicyMemberRepositoryService.createOrUpdateByGroupPolicyIdAndMemberId(
            groupPolicyMemberEntities,
        );

        return groupPolicyMemberEntities.map((entity) => {
            return {
                groupPolicyId: entity.groupPolicyId,
                memberId: entity.memberId,
                userId: entity.userId,
                securityProviderId: entity.securityProviderId,
                distinguishedName: entity.distinguishedName,
                groupName: entity.groupName,
            };
        });
    }
}
