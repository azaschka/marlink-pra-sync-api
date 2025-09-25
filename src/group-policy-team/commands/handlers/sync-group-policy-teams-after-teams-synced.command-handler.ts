import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GroupPolicyTeamRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { RetrieveAllGroupPolicyTeamsQuery as BTRetrieveAllGroupPolicyTeamsQuery } from '../../../beyondtrust-pra-conf-api/group-policy/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyTeamsSyncedEvent, GroupPolicyTeamsSyncFailedEvent } from '../../events';
import { GroupPolicyTeam } from '../../models';
import { GroupPolicyTeamEntity } from '../../repositories/entities';
import { GroupPolicyTeamRepositoryService } from '../../repositories/services/group-policy-team-repository.service';
import { SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommand } from '../sync-group-policy-teams-after-group-policies-synced.command';

@CommandHandler(SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommand)
export class SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommandHandler
    implements ICommandHandler<SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommand>
{
    constructor(
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyTeamRepositoryService: GroupPolicyTeamRepositoryService,
    ) {}

    public async execute(command: SyncGroupPolicyTeamsAfterGroupPoliciesSyncedCommand): Promise<void> {
        for (const groupPolicyId of [...command.createdGroupPolicyIds, ...command.updatedGroupPolicyIds]) {
            try {
                const btGroupPolicyTeams = await this.retrieveAllBTGroupPolicyTeams(
                    command.transactionId,
                    command.tenantId,
                    groupPolicyId,
                );
                const groupPolicyTeamEntities = this.createGroupPolicyTeamEntities(groupPolicyId, btGroupPolicyTeams);
                const groupPolicyTeams = await this.replaceGroupPolicyTeams(
                    command.tenantId,
                    groupPolicyId,
                    groupPolicyTeamEntities,
                );

                if (groupPolicyTeams.length === 0) {
                    continue;
                }

                this.eventBus.publish(
                    new GroupPolicyTeamsSyncedEvent(command.transactionId, {
                        groupPolicyTeams: groupPolicyTeams,
                        tenantId: command.tenantId,
                    }),
                );
            } catch (error) {
                this.eventBus.publish(
                    new GroupPolicyTeamsSyncFailedEvent(command.transactionId, {
                        errorMessage: `Failed to sync for group policy "${groupPolicyId}": ${ErrorProcessorUtility.stringify(error)}`,
                        tenantId: command.tenantId,
                    }),
                );
            }
        }

        try {
            await this.groupPolicyTeamRepositoryService.deleteByGroupPolicyIds(
                command.tenantId,
                command.deletedGroupPolicyIds,
            );
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyTeamsSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    tenantId: command.tenantId,
                }),
            );
        }
    }

    private async retrieveAllBTGroupPolicyTeams(transactionId: string, tenantId: number, groupPolicyId: number) {
        return await this.queryBus.execute<BTRetrieveAllGroupPolicyTeamsQuery, GroupPolicyTeamRetrievedDtoOutput[]>(
            new BTRetrieveAllGroupPolicyTeamsQuery(transactionId, tenantId, groupPolicyId),
        );
    }

    private createGroupPolicyTeamEntities(
        groupPolicyId: number,
        btGroupPolicyTeams: GroupPolicyTeamRetrievedDtoOutput[],
    ) {
        return btGroupPolicyTeams.map((groupPolicyTeam) =>
            GroupPolicyTeamEntity.create(groupPolicyId, groupPolicyTeam.teamId, groupPolicyTeam.role),
        );
    }

    private async replaceGroupPolicyTeams(
        tenantId: number,
        groupPolicyId: number,
        groupPolicyTeamEntities: GroupPolicyTeamEntity[],
    ): Promise<GroupPolicyTeam[]> {
        // Delete all existing group policy teams
        await this.groupPolicyTeamRepositoryService.deleteByGroupPolicyId(tenantId, groupPolicyId);

        // Recreate the group policy teams
        await this.groupPolicyTeamRepositoryService.createOrUpdateByGroupPolicyIdAndTeamId(
            tenantId,
            groupPolicyTeamEntities,
        );

        return groupPolicyTeamEntities.map((entity) => {
            return {
                groupPolicyId: entity.groupPolicyId,
                teamId: entity.teamId,
                roleType: entity.roleType,
                lastSyncDate: entity.lastSyncDate,
            };
        });
    }
}
