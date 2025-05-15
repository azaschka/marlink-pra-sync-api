import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateTeamCommand as BTCreateTeamCommand } from '../../../beyondtrust-pra-conf-api/team/commands';
import { TeamCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
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
        private readonly eventBus: EventBus,
        private readonly teamRepositoryService: TeamRepositoryService,
    ) {}

    public async execute(command: CreateTeamCommand): Promise<Team> {
        const btTeam = await this.createBTTeam(command);
        const teamEntity = this.createTeamEntity(btTeam);

        try {
            const createdTeam = await this.teamRepositoryService.create(teamEntity);

            this.eventBus.publish(
                new TeamCreatedEvent(command.transactionId, {
                    team: createdTeam,
                }),
            );

            return createdTeam;
        } catch (error) {
            this.eventBus.publish(
                new TeamCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    team: teamEntity,
                }),
            );

            throw error;
        }
    }

    private async createBTTeam(command: CreateTeamCommand) {
        return await this.commandBus.execute<BTCreateTeamCommand, TeamCreatedDtoOutput>(
            new BTCreateTeamCommand(command.transactionId, command.name, command.codeName, command.comments),
        );
    }

    private createTeamEntity(btTeam: TeamCreatedDtoOutput) {
        return TeamEntity.create(btTeam.id, btTeam.name, btTeam.codeName, btTeam.comments);
    }
}
