import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteShellJumpCommand as BTDeleteShellJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/commands';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { ShellJumpDeletedEvent, ShellJumpDeletionFailedEvent } from '../../events';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { DeleteShellJumpCommand } from '../delete-shell-jump.command';

@CommandHandler(DeleteShellJumpCommand)
export class DeleteShellJumpCommandHandler implements ICommandHandler<DeleteShellJumpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly shellJumpRepositoryService: ShellJumpRepositoryService,
    ) {}

    public async execute(command: DeleteShellJumpCommand): Promise<void> {
        await this.commandBus.execute<BTDeleteShellJumpCommand, void>(
            new BTDeleteShellJumpCommand(command.transactionId, command.id),
        );

        try {
            await this.shellJumpRepositoryService.deleteById(command.tenantId, command.id);

            this.eventBus.publish(
                new ShellJumpDeletedEvent(command.transactionId, { id: command.id, tenantId: command.tenantId }),
            );
        } catch (error) {
            this.eventBus.publish(
                new ShellJumpDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }
}
