import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteJumpGroupCommand as BTDeleteJumpGroupCommand } from '../../../beyondtrust-pra-conf-api/jump-group/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpGroupDeletedEvent, JumpGroupDeletionFailedEvent } from '../../events';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { DeleteJumpGroupCommand } from '../delete-jump-group.command';

@CommandHandler(DeleteJumpGroupCommand)
export class DeleteJumpGroupCommandHandler implements ICommandHandler<DeleteJumpGroupCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpGroupRepositoryService: JumpGroupRepositoryService,
    ) {}

    public async execute(command: DeleteJumpGroupCommand): Promise<void> {
        await this.commandBus.execute<BTDeleteJumpGroupCommand, void>(
            new BTDeleteJumpGroupCommand(command.transactionId, command.id),
        );

        try {
            await this.jumpGroupRepositoryService.deleteById(command.tenantId, command.id);

            this.eventBus.publish(new JumpGroupDeletedEvent(command.transactionId, { id: command.id }));
        } catch (error) {
            this.eventBus.publish(
                new JumpGroupDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                }),
            );

            throw error;
        }
    }
}
