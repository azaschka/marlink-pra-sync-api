import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CreateTeamCommand as BTCreateTeamCommand } from '../../../beyondtrust-pra-conf-api/team/commands';
import { TeamCreatedDtoOutput, TeamRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { RetrieveTeamsQuery as BTRetrieveTeamsQuery } from '../../../beyondtrust-pra-conf-api/team/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { TeamCreatedEvent, TeamCreationFailedEvent } from '../../events';
import { Team } from '../../models';
import { TeamEntity } from '../../repositories/entities';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { CreateTeamCommand } from '../create-team.command';

@CommandHandler(CreateTeamCommand)
export class CreateTeamCommandHandler implements ICommandHandler<CreateTeamCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly teamRepositoryService: TeamRepositoryService,
    ) {}

    public async execute(command: CreateTeamCommand): Promise<Team> {
        const { btTeam, existedInBeyondTrust } = await this.getOrCreateBTTeam(command);
        const teamEntity = this.createTeamEntity(btTeam);

        try {
            let savedTeam: Team;

            if (existedInBeyondTrust) {
                // Team already existed in BeyondTrust but was missing from the local sync DB.
                // Use upsert to heal the sync DB and avoid a duplicate-key error.
                await this.teamRepositoryService.createOrUpdateById(command.tenantId, teamEntity);
                savedTeam = teamEntity;
            } else {
                savedTeam = await this.teamRepositoryService.create(command.tenantId, teamEntity);
            }

            this.eventBus.publish(
                new TeamCreatedEvent(command.transactionId, {
                    team: savedTeam,
                    tenantId: command.tenantId,
                }),
            );

            return savedTeam;
        } catch (error) {
            this.eventBus.publish(
                new TeamCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    team: teamEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    /**
     * Attempts to create the team in BeyondTrust.
     * If BeyondTrust rejects with 422 and any field reports "already been taken",
     * the existing team is fetched instead.
     * This ensures true idempotency even when the local sync DB is out of sync with BeyondTrust
     * (e.g. after a DB reset or before the first discrepancy scan has run).
     */
    private async getOrCreateBTTeam(
        command: CreateTeamCommand,
    ): Promise<{ btTeam: TeamCreatedDtoOutput; existedInBeyondTrust: boolean }> {
        try {
            const btTeam = await this.createBTTeam(command);
            return { btTeam, existedInBeyondTrust: false };
        } catch (error) {
            if (ErrorProcessorUtility.isBeyondTrustUnprocessableEntityError(error)) {
                console.warn(
                    `[${command.transactionId}] Team "${command.name}" already exists in BeyondTrust ` +
                        `(tenant: ${command.tenantId}). Fetching existing team to ensure idempotency.`,
                );

                const existing = await this.fetchExistingBTTeamByName(
                    command.transactionId,
                    command.tenantId,
                    command.name,
                );

                if (existing) {
                    // TeamRetrievedDtoOutput has an identical structure to TeamCreatedDtoOutput;
                    // casting is safe here.
                    return {
                        btTeam: existing as unknown as TeamCreatedDtoOutput,
                        existedInBeyondTrust: true,
                    };
                }
            }

            throw error;
        }
    }

    /**
     * Fetches the first team from BeyondTrust that matches the given name.
     */
    private async fetchExistingBTTeamByName(
        transactionId: string,
        tenantId: number,
        name: string,
    ): Promise<TeamRetrievedDtoOutput | null> {
        const teams = await this.queryBus.execute<BTRetrieveTeamsQuery, TeamRetrievedDtoOutput[]>(
            new BTRetrieveTeamsQuery(transactionId, tenantId, 1, 1, name),
        );
        return teams[0] ?? null;
    }

    private async createBTTeam(command: CreateTeamCommand) {
        return await this.commandBus.execute<BTCreateTeamCommand, TeamCreatedDtoOutput>(
            new BTCreateTeamCommand(
                command.transactionId,
                command.tenantId,
                command.name,
                command.codeName,
                command.comments,
            ),
        );
    }

    private createTeamEntity(btTeam: TeamCreatedDtoOutput) {
        return TeamEntity.create(btTeam.id, btTeam.name, btTeam.codeName, btTeam.comments);
    }
}
