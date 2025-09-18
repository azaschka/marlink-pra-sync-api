import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { TeamRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { RetrieveTeamsQuery } from '../../../beyondtrust-pra-conf-api/team/queries';
import { DateUtility, ErrorProcessorUtility, ObjectUtility } from '../../../shared/utilities';
import { TeamsSyncedEvent, TeamsSyncFailedEvent } from '../../events';
import { TeamsSyncResult } from '../../models';
import { TeamEntity } from '../../repositories/entities';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { SyncTeamsCommand } from '../sync-teams.command';

@CommandHandler(SyncTeamsCommand)
export class SyncTeamsCommandHandler implements ICommandHandler<SyncTeamsCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly teamRepositoryService: TeamRepositoryService,
    ) {}

    public async execute(command: SyncTeamsCommand): Promise<TeamsSyncResult> {
        try {
            const startSyncUtcDate = DateUtility.getCurrentUtcDate();

            const createdTeamIds: number[] = [];
            const updatedTeamIds: number[] = [];
            const deletedTeamIds: number[] = [];

            await this.syncBTToDbTeamsPerPage(
                command.transactionId,
                command.tenantId,
                1,
                createdTeamIds,
                updatedTeamIds,
            );
            await this.syncDbToBTTeamsPerPage(command.tenantId, 1, startSyncUtcDate, deletedTeamIds);

            this.eventBus.publish(
                new TeamsSyncedEvent(command.transactionId, {
                    createdTeamIds,
                    updatedTeamIds,
                    deletedTeamIds,
                }),
            );

            return {
                createdTeamIds,
                updatedTeamIds,
                deletedTeamIds,
            };
        } catch (error) {
            this.eventBus.publish(
                new TeamsSyncFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                }),
            );

            throw error;
        }
    }

    private async syncBTToDbTeamsPerPage(
        transactionId: string,
        tenantId: number,
        pageNumber: number,
        createdTeamIds: number[],
        updatedTeamIds: number[],
    ) {
        // Retrieve teams from BeyondTrust
        const btTeams = await this.queryBus.execute<RetrieveTeamsQuery, TeamRetrievedDtoOutput[]>(
            new RetrieveTeamsQuery(transactionId, this.appConfigService.sync.maxBatchSize, pageNumber),
        );

        // BT always return last page's data when we exceed the pagination limit. Therefore, we check for repeating ids.
        if (
            ObjectUtility.contain(
                [...createdTeamIds, ...updatedTeamIds],
                btTeams.map((team) => team.id),
            )
        ) {
            return;
        }

        // Retrieve existing teams from the DB using BeyondTrust team IDs
        const dbTeams = await this.teamRepositoryService.findByIds(
            tenantId,
            btTeams.map((team) => team.id).filter((id) => id !== undefined),
        );

        const teamsToBeCreated = this.findAllTeamsToBeCreated(btTeams, dbTeams);
        const teamsToBeUpdated = this.findAllTeamsToBeUpdatedOrUpdateLastSyncDate(btTeams, dbTeams);

        if (teamsToBeCreated.length > 0) {
            await this.teamRepositoryService.createOrUpdateByIds(tenantId, teamsToBeCreated);
        }

        if (teamsToBeUpdated.length > 0) {
            await this.teamRepositoryService.createOrUpdateByIds(tenantId, teamsToBeUpdated);
        }

        // Collect created and updated team IDs
        createdTeamIds.push(...teamsToBeCreated.map((team) => team.id));
        updatedTeamIds.push(...teamsToBeUpdated.map((team) => team.id));

        if (btTeams.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncBTToDbTeamsPerPage(transactionId, tenantId, pageNumber + 1, createdTeamIds, updatedTeamIds);
    }

    private async syncDbToBTTeamsPerPage(
        tenantId: number,
        pageNumber: number,
        dateBeforeSyncingBTTeams: Date,
        deletedTeamIds: number[],
    ) {
        const dbTeams = await this.teamRepositoryService.findByLastSyncDateBefore(
            tenantId,
            dateBeforeSyncingBTTeams,
            pageNumber,
            this.appConfigService.sync.maxBatchSize,
        );
        const teamIds = dbTeams.map((dbTeam) => dbTeam.id);

        if (teamIds.length > 0) {
            await this.teamRepositoryService.deleteByIds(tenantId, teamIds);
        }

        // Collect deleted team IDs
        deletedTeamIds.push(...teamIds);

        if (dbTeams.length < this.appConfigService.sync.maxBatchSize) {
            return;
        }

        await this.syncDbToBTTeamsPerPage(tenantId, pageNumber + 1, dateBeforeSyncingBTTeams, deletedTeamIds);
    }

    private findAllTeamsToBeCreated(btTeams: TeamRetrievedDtoOutput[], dbTeams: TeamEntity[]) {
        return btTeams
            .filter((btTeam) => !dbTeams.some((dbTeam) => dbTeam.id === btTeam.id))
            .map((btTeam) => this.createTeamEntity(btTeam));
    }

    private findAllTeamsToBeUpdatedOrUpdateLastSyncDate(btTeams: TeamRetrievedDtoOutput[], dbTeams: TeamEntity[]) {
        return btTeams
            .filter((btTeam) => dbTeams.find((dbTeam) => dbTeam.id === btTeam.id))
            .map((btTeam) => this.createTeamEntity(btTeam));
    }

    private createTeamEntity(btTeam: TeamRetrievedDtoOutput) {
        return TeamEntity.create(btTeam.id, btTeam.name, btTeam.codeName, btTeam.comments);
    }
}
