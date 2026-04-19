import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpointNodeDeletedEvent, JumpointNodeDeletionFailedEvent } from '../../events';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { DeleteJumpointNodeCommand } from '../delete-jumpoint-node.command';

@CommandHandler(DeleteJumpointNodeCommand)
export class DeleteJumpointNodeCommandHandler implements ICommandHandler<DeleteJumpointNodeCommand> {
    constructor(
        private readonly eventBus: EventBus,
        private readonly jumpointNodeRepositoryService: JumpointNodeRepositoryService,
    ) {}

    public async execute(command: DeleteJumpointNodeCommand): Promise<void> {
        const jumpointNode = await this.jumpointNodeRepositoryService.findOneById(command.id);

        if (!jumpointNode) {
            throw new NotFoundException(`Jumpoint Node with ID ${command.id} not found.`);
        }

        try {
            await this.jumpointNodeRepositoryService.deleteById(command.id);

            this.eventBus.publish(new JumpointNodeDeletedEvent(command.transactionId, { id: command.id }));
        } catch (error) {
            this.eventBus.publish(
                new JumpointNodeDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                }),
            );

            throw error;
        }
    }
}
