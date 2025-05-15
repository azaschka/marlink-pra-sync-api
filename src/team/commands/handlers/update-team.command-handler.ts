import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ModifyTeamCommand as BTModifyTeamCommand } from '../../../beyondtrust-pra-conf-api/team/commands';
import { TeamModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { TeamUpdatedEvent, TeamUpdateFailedEvent } from '../../events';
import { Team } from '../../models';
import { TeamEntity } from '../../repositories/entities';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { UpdateTeamCommand } from '../update-team.command';

@CommandHandler(UpdateTeamCommand)
export class UpdateTeamCommandHandler implements ICommandHandler<UpdateTeamCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly teamRepositoryService: TeamRepositoryService,
    ) {}

    public async execute(command: UpdateTeamCommand): Promise<Team> {
        const btTeam = await this.modifyBTTeam(command);
        const teamEntity = this.createTeamEntity(btTeam);

        try {
            const updatedTeam = await this.updateTeam(teamEntity);

            this.eventBus.publish(
                new TeamUpdatedEvent(command.transactionId, {
                    team: updatedTeam,
                }),
            );

            return updatedTeam;
        } catch (error) {
            this.eventBus.publish(
                new TeamUpdateFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    team: teamEntity,
                }),
            );

            throw error;
        }
    }

    private async modifyBTTeam(command: UpdateTeamCommand) {
        return await this.commandBus.execute<BTModifyTeamCommand, TeamModifiedDtoOutput>(
            new BTModifyTeamCommand(
                command.transactionId,
                command.id,
                command.name,
                command.codeName,
                command.comments,
            ),
        );
    }

    private createTeamEntity(btTeam: TeamModifiedDtoOutput) {
        return TeamEntity.create(btTeam.id, btTeam.name, btTeam.codeName, btTeam.comments);
    }

    private async updateTeam(teamEntity: TeamEntity) {
        await this.teamRepositoryService.createOrUpdateById(teamEntity);

        const createdOrUpdatedTeam = await this.teamRepositoryService.findOneById(teamEntity.id);

        if (!createdOrUpdatedTeam) {
            throw new Error('Team has been created or updated but could not be retrieved.');
        }

        return createdOrUpdatedTeam;
    }
}
