import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BeyondtrustInstanceDeletedEvent } from '../../events';
import { BeyondtrustInstanceRepositoryService } from '../../repositories/services/beyondtrust-instance-repository.service';
import { DeleteBeyondtrustInstanceCommand } from '../delete-beyondtrust-instance.command';

@CommandHandler(DeleteBeyondtrustInstanceCommand)
export class DeleteBeyondtrustInstanceCommandHandler implements ICommandHandler<DeleteBeyondtrustInstanceCommand> {
    constructor(
        private readonly eventBus: EventBus,
        private readonly beyondtrustInstanceRepositoryService: BeyondtrustInstanceRepositoryService,
    ) {}

    public async execute(command: DeleteBeyondtrustInstanceCommand): Promise<void> {
        const btInstance = await this.beyondtrustInstanceRepositoryService.findOneById(command.id);

        if (!btInstance) {
            throw new NotFoundException();
        }

        await this.beyondtrustInstanceRepositoryService.deleteById(command.id);

        this.eventBus.publish(new BeyondtrustInstanceDeletedEvent(command.transactionId, { id: command.id }));
    }
}
