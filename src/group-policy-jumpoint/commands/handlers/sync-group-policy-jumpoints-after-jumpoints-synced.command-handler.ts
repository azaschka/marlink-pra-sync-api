import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GroupPolicyJumpointRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { RetrieveAllGroupPolicyJumpointsQuery as BTRetrieveAllGroupPolicyJumpointsQuery } from '../../../beyondtrust-pra-conf-api/group-policy/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyJumpointsSyncedEvent, GroupPolicyJumpointsSyncFailedEvent } from '../../events';
import { GroupPolicyJumpoint } from '../../models';
import { GroupPolicyJumpointEntity } from '../../repositories/entities';
import { GroupPolicyJumpointRepositoryService } from '../../repositories/services/group-policy-jumpoint-repository.service';
import { SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommand } from '../sync-group-policy-jumpoints-after-group-policies-synced.command';

@CommandHandler(SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommand)
export class SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommandHandler
    implements ICommandHandler<SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommand>
{
    constructor(
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyJumpointRepositoryService: GroupPolicyJumpointRepositoryService,
    ) {}

    public async execute(command: SyncGroupPolicyJumpointsAfterGroupPoliciesSyncedCommand): Promise<void> {
        for (const groupPolicyId of [...command.createdGroupPolicyIds, ...command.updatedGroupPolicyIds]) {
            try {
                const btGroupPolicyJumpoints = await this.retrieveAllBTGroupPolicyJumpoints(
                    command.transactionId,
                    command.tenantId,
                    groupPolicyId,
                );
                const groupPolicyJumpointEntities = this.createGroupPolicyJumpointEntities(
                    groupPolicyId,
                    btGroupPolicyJumpoints,
                );
                const groupPolicyJumpoints = await this.replaceGroupPolicyJumpoints(
                    command.tenantId,
                    groupPolicyId,
                    groupPolicyJumpointEntities,
                );

                if (groupPolicyJumpoints.length === 0) {
                    continue;
                }

                this.eventBus.publish(
                    new GroupPolicyJumpointsSyncedEvent(command.transactionId, {
                        groupPolicyJumpoints: groupPolicyJumpoints,
                        tenantId: command.tenantId,
                    }),
                );
            } catch (error) {
                this.eventBus.publish(
                    new GroupPolicyJumpointsSyncFailedEvent(command.transactionId, {
                        errorMessage: `Failed to sync for group policy "${groupPolicyId}": ${ErrorProcessorUtility.stringify(error)}`,
                        tenantId: command.tenantId,
                    }),
                );
            }
        }

        try {
            await this.groupPolicyJumpointRepositoryService.deleteByGroupPolicyIds(
                command.tenantId,
                command.deletedGroupPolicyIds,
            );
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyJumpointsSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    tenantId: command.tenantId,
                }),
            );
        }
    }

    private async retrieveAllBTGroupPolicyJumpoints(transactionId: string, tenantId: number, groupPolicyId: number) {
        return await this.queryBus.execute<
            BTRetrieveAllGroupPolicyJumpointsQuery,
            GroupPolicyJumpointRetrievedDtoOutput[]
        >(new BTRetrieveAllGroupPolicyJumpointsQuery(transactionId, tenantId, groupPolicyId));
    }

    private createGroupPolicyJumpointEntities(
        groupPolicyId: number,
        btGroupPolicyJumpoints: GroupPolicyJumpointRetrievedDtoOutput[],
    ) {
        return btGroupPolicyJumpoints.map((groupPolicyJumpoint) =>
            GroupPolicyJumpointEntity.create(groupPolicyId, groupPolicyJumpoint.jumpointId),
        );
    }

    private async replaceGroupPolicyJumpoints(
        tenantId: number,
        groupPolicyId: number,
        groupPolicyJumpointEntities: GroupPolicyJumpointEntity[],
    ): Promise<GroupPolicyJumpoint[]> {
        // Delete all existing group policy jumpoints
        await this.groupPolicyJumpointRepositoryService.deleteByGroupPolicyId(tenantId, groupPolicyId);

        // Recreate the group policy jumpoints
        await this.groupPolicyJumpointRepositoryService.createOrUpdateByGroupPolicyIdAndJumpointId(
            tenantId,
            groupPolicyJumpointEntities,
        );

        return groupPolicyJumpointEntities.map((entity) => {
            return {
                groupPolicyId: entity.groupPolicyId,
                jumpointId: entity.jumpointId,
                lastSyncDate: entity.lastSyncDate,
            };
        });
    }
}
