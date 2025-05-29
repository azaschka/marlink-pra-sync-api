import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteJumpointCommand as BTDeleteJumpointCommand } from '../../../beyondtrust-pra-conf-api/jumpoint/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpointDeletedEvent, JumpointDeletionFailedEvent } from '../../events';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { DeleteJumpointCommand } from '../delete-jumpoint.command';

@CommandHandler(DeleteJumpointCommand)
export class DeleteJumpointCommandHandler implements ICommandHandler<DeleteJumpointCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpointRepositoryService: JumpointRepositoryService,
    ) {}

    public async execute(command: DeleteJumpointCommand): Promise<void> {
        await this.commandBus.execute<BTDeleteJumpointCommand, void>(
            new BTDeleteJumpointCommand(command.transactionId, command.id),
        );

        try {
            await this.jumpointRepositoryService.deleteById(command.id);

            this.eventBus.publish(new JumpointDeletedEvent(command.transactionId, { id: command.id }));
        } catch (error) {
            this.eventBus.publish(
                new JumpointDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                }),
            );

            throw error;
        }
    }
}
