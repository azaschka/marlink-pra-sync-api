import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTeamCommand as BTDeleteTeamCommand } from '../../../beyondtrust-pra-conf-api/team/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { TeamDeletedEvent, TeamDeletionFailedEvent } from '../../events';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { DeleteTeamCommand } from '../delete-team.command';

@CommandHandler(DeleteTeamCommand)
export class DeleteTeamCommandHandler implements ICommandHandler<DeleteTeamCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly teamRepositoryService: TeamRepositoryService,
    ) {}

    public async execute(command: DeleteTeamCommand): Promise<void> {
        await this.commandBus.execute<BTDeleteTeamCommand, void>(
            new BTDeleteTeamCommand(command.transactionId, command.id),
        );

        try {
            await this.teamRepositoryService.deleteById(command.id);

            this.eventBus.publish(new TeamDeletedEvent(command.transactionId, { id: command.id }));
        } catch (error) {
            this.eventBus.publish(
                new TeamDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                }),
            );

            throw error;
        }
    }
}
