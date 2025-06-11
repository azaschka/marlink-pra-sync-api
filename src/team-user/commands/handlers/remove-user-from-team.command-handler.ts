import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RemoveUserFromTeamCommand as BTRemoveUserFromTeamCommand } from '../../../beyondtrust-pra-conf-api/team/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { TeamUserRemovalFailedEvent, TeamUserRemovedEvent } from '../../events';
import { TeamUserRepositoryService } from '../../repositories/services/team-user-repository.service';
import { RemoveUserFromTeamCommand } from '../remove-user-from-team.command';

@CommandHandler(RemoveUserFromTeamCommand)
export class RemoveUserFromTeamCommandHandler implements ICommandHandler<RemoveUserFromTeamCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly teamUserRepositoryService: TeamUserRepositoryService,
    ) {}

    public async execute(command: RemoveUserFromTeamCommand): Promise<void> {
        await this.removeBTTeamUser(command);

        try {
            await this.removeTeamUser(command.id, command.userId);

            this.eventBus.publish(
                new TeamUserRemovedEvent(command.transactionId, {
                    teamId: command.id,
                    userId: command.userId,
                }),
            );
        } catch (error) {
            this.eventBus.publish(
                new TeamUserRemovalFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    teamId: command.id,
                    userId: command.userId,
                }),
            );

            throw error;
        }
    }

    private async removeBTTeamUser(command: RemoveUserFromTeamCommand) {
        await this.commandBus.execute<BTRemoveUserFromTeamCommand, void>(
            new BTRemoveUserFromTeamCommand(command.transactionId, command.id, command.userId),
        );
    }

    private async removeTeamUser(teamId: number, userId: number): Promise<void> {
        await this.teamUserRepositoryService.deleteByTeamIdAndUserId(teamId, userId);
    }
}
