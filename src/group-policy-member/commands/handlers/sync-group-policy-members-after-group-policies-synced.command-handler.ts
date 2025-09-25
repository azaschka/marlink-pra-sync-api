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
                    command.tenantId,
                    groupPolicyId,
                );
                const groupPolicyMemberEntities = this.createGroupPolicyMemberEntities(
                    groupPolicyId,
                    btGroupPolicyMembers,
                );
                const groupPolicyMembers = await this.replaceGroupPolicyMembers(
                    command.tenantId,
                    groupPolicyId,
                    groupPolicyMemberEntities,
                );

                if (groupPolicyMembers.length === 0) {
                    continue;
                }

                this.eventBus.publish(
                    new GroupPolicyMembersSyncedEvent(command.transactionId, {
                        groupPolicyMembers: groupPolicyMembers,
                        tenantId: command.tenantId,
                    }),
                );
            } catch (error) {
                this.eventBus.publish(
                    new GroupPolicyMembersSyncFailedEvent(command.transactionId, {
                        errorMessage: `Failed to sync for group policy "${groupPolicyId}": ${ErrorProcessorUtility.stringify(error)}`,
                        tenantId: command.tenantId,
                    }),
                );
            }
        }

        try {
            await this.groupPolicyMemberRepositoryService.deleteByGroupPolicyIds(
                command.tenantId,
                command.deletedGroupPolicyIds,
            );
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyMembersSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    tenantId: command.tenantId,
                }),
            );
        }
    }

    private async retrieveAllBTGroupPolicyMembers(transactionId: string, tenantId: number, groupPolicyId: number) {
        return await this.queryBus.execute<BTRetrieveAllGroupPolicyMembersQuery, GroupPolicyMemberRetrievedDtoOutput[]>(
            new BTRetrieveAllGroupPolicyMembersQuery(transactionId, tenantId, groupPolicyId),
        );
    }

    private createGroupPolicyMemberEntities(
        groupPolicyId: number,
        btGroupPolicyMembers: GroupPolicyMemberRetrievedDtoOutput[],
    ) {
        return btGroupPolicyMembers
            .filter((groupPolicyMember) => !!groupPolicyMember.userId) // Ensure userId is present cause some members might not have it
            .map((groupPolicyMember) =>
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
        tenantId: number,
        groupPolicyId: number,
        groupPolicyMemberEntities: GroupPolicyMemberEntity[],
    ): Promise<GroupPolicyMember[]> {
        // Delete all existing group policy members
        await this.groupPolicyMemberRepositoryService.deleteByGroupPolicyId(tenantId, groupPolicyId);

        // Recreate the group policy members
        await this.groupPolicyMemberRepositoryService.createOrUpdateByGroupPolicyIdAndMemberId(
            tenantId,
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
                lastSyncDate: entity.lastSyncDate,
            };
        });
    }
}
