import { HttpException, HttpStatus } from '@nestjs/common';
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
        try {
            await this.commandBus.execute<BTDeleteTeamCommand, void>(
                new BTDeleteTeamCommand(command.transactionId, command.tenantId, command.id),
            );
        } catch (error) {
            if (!(error instanceof HttpException && error.getStatus() === HttpStatus.NOT_FOUND)) {
                throw error;
            }
            console.log(
                `[${command.transactionId}] Team ${command.id} not found in BeyondTrust (404) – proceeding with local DB cleanup`,
            );
        }

        try {
            await this.teamRepositoryService.deleteById(command.tenantId, command.id);

            this.eventBus.publish(
                new TeamDeletedEvent(command.transactionId, { id: command.id, tenantId: command.tenantId }),
            );
        } catch (error) {
            this.eventBus.publish(
                new TeamDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }
}
