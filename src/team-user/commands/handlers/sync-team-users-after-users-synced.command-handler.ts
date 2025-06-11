import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { TeamUserRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { RetrieveTeamUsersQuery as BTRetrieveTeamUsersQuery } from '../../../beyondtrust-pra-conf-api/team/queries';
import { ErrorProcessorUtility, ObjectUtility } from '../../../shared/utilities';
import { TeamUsersSyncedEvent, TeamUsersSyncFailedEvent } from '../../events';
import { mapFromBTUserTeamRoleType } from '../../mappers';
import { TeamUsers } from '../../models';
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
        private readonly appConfigService: AppConfigService,
        private readonly teamUserRepositoryService: TeamUserRepositoryService,
    ) {}

    public async execute(command: SyncTeamUsersAfterTeamsSyncedCommand): Promise<void> {
        for (const teamId of [...command.createdTeamIds, ...command.updatedTeamIds]) {
            try {
                const btTeamUsers = await this.retrieveAllBTTeamUsers(command.transactionId, teamId);
                const teamUserEntities = this.createTeamUserEntities(btTeamUsers);
                const teamUsers = await this.replaceTeamUsers(teamId, teamUserEntities);

                this.eventBus.publish(
                    new TeamUsersSyncedEvent(command.transactionId, {
                        teamUsers: teamUsers,
                    }),
                );
            } catch (error) {
                this.eventBus.publish(
                    new TeamUsersSyncFailedEvent(command.transactionId, {
                        errorMessage: ErrorProcessorUtility.stringify(error),
                    }),
                );
            }
        }

        try {
            await this.teamUserRepositoryService.deleteByTeamIds(command.deletedTeamIds);
        } catch (error) {
            this.eventBus.publish(
                new TeamUsersSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                }),
            );
        }
    }

    private async retrieveAllBTTeamUsers(transactionId: string, teamId: number) {
        const allTeamUsers: TeamUserRetrievedDtoOutput[] = [];
        const maxBatchSize = this.appConfigService.sync.maxBatchSize;
        let pageNumber = 1;

        while (true) {
            const batch = await this.queryBus.execute<BTRetrieveTeamUsersQuery, TeamUserRetrievedDtoOutput[]>(
                new BTRetrieveTeamUsersQuery(transactionId, maxBatchSize, pageNumber, teamId),
            );

            // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
            if (
                ObjectUtility.contain(
                    allTeamUsers.map((teamUser) => teamUser.userId),
                    batch.map((teamUser) => teamUser.userId),
                )
            ) {
                break;
            }

            allTeamUsers.push(...batch);

            if (batch.length === 0 || batch.length < maxBatchSize) {
                break;
            }

            pageNumber++;
        }

        return allTeamUsers;
    }

    private createTeamUserEntities(btTeamUsers: TeamUserRetrievedDtoOutput[]) {
        return btTeamUsers.map((teamUser) =>
            TeamUserEntity.create(teamUser.teamId, teamUser.userId, mapFromBTUserTeamRoleType(teamUser.role)),
        );
    }

    private async replaceTeamUsers(teamId: number, teamUserEntities: TeamUserEntity[]): Promise<TeamUsers> {
        // Delete all existing team users
        await this.teamUserRepositoryService.deleteByTeamId(teamId);

        // Recreate the team users
        await this.teamUserRepositoryService.createOrUpdateByTeamIdAndUserId(teamUserEntities);

        return {
            teamId: teamId,
            memberships: teamUserEntities.map((entity) => ({
                userId: entity.userId,
                roleType: entity.roleType,
            })),
        };
    }
}
