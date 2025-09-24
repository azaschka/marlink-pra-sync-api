import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { TeamUserRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { RetrieveAllTeamUsersQuery as BTRetrieveAllTeamUsersQuery } from '../../../beyondtrust-pra-conf-api/team/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { TeamUsersSyncedEvent, TeamUsersSyncFailedEvent } from '../../events';
import { mapFromBTUserTeamRoleType } from '../../mappers';
import { TeamUser } from '../../models';
import { TeamUserEntity } from '../../repositories/entities';
import { TeamUserRepositoryService } from '../../repositories/services/team-user-repository.service';
import { SyncTeamUsersAfterTeamsSyncedCommand } from '../sync-team-users-after-teams-synced.command';

@CommandHandler(SyncTeamUsersAfterTeamsSyncedCommand)
export class SyncTeamUsersAfterTeamsSyncedCommandHandler
    implements ICommandHandler<SyncTeamUsersAfterTeamsSyncedCommand>
{
    constructor(
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly teamUserRepositoryService: TeamUserRepositoryService,
    ) {}

    public async execute(command: SyncTeamUsersAfterTeamsSyncedCommand): Promise<void> {
        for (const teamId of [...command.createdTeamIds, ...command.updatedTeamIds]) {
            try {
                const btTeamUsers = await this.retrieveAllBTTeamUsers(command.transactionId, teamId);
                const teamUserEntities = this.createTeamUserEntities(btTeamUsers);
                const teamUsers = await this.replaceTeamUsers(command.tenantId, teamId, teamUserEntities);

                if (teamUsers.length === 0) {
                    continue;
                }

                this.eventBus.publish(
                    new TeamUsersSyncedEvent(command.transactionId, {
                        teamUsers: teamUsers,
                        tenantId: command.tenantId,
                    }),
                );
            } catch (error) {
                this.eventBus.publish(
                    new TeamUsersSyncFailedEvent(command.transactionId, {
                        errorMessage: `Failed to sync for team "${teamId}": ${ErrorProcessorUtility.stringify(error)}`,
                        tenantId: command.tenantId,
                    }),
                );
            }
        }

        try {
            await this.teamUserRepositoryService.deleteByTeamIds(command.tenantId, command.deletedTeamIds);
        } catch (error) {
            this.eventBus.publish(
                new TeamUsersSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    tenantId: command.tenantId,
                }),
            );
        }
    }

    private async retrieveAllBTTeamUsers(transactionId: string, teamId: number) {
        return await this.queryBus.execute<BTRetrieveAllTeamUsersQuery, TeamUserRetrievedDtoOutput[]>(
            new BTRetrieveAllTeamUsersQuery(transactionId, teamId),
        );
    }

    private createTeamUserEntities(btTeamUsers: TeamUserRetrievedDtoOutput[]) {
        return btTeamUsers.map((teamUser) =>
            TeamUserEntity.create(teamUser.teamId, teamUser.userId, mapFromBTUserTeamRoleType(teamUser.role)),
        );
    }

    private async replaceTeamUsers(
        tenantId: number,
        teamId: number,
        teamUserEntities: TeamUserEntity[],
    ): Promise<TeamUser[]> {
        // Delete all existing team users
        await this.teamUserRepositoryService.deleteByTeamId(tenantId, teamId);

        // Recreate the team users
        await this.teamUserRepositoryService.createOrUpdateByTeamIdAndUserId(tenantId, teamUserEntities);

        return teamUserEntities.map((entity) => ({
            teamId: teamId,
            userId: entity.userId,
            roleType: entity.roleType,
            lastSyncDate: entity.lastSyncDate,
        }));
    }
}
