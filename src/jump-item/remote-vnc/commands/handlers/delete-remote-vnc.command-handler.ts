import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteRemoteVncCommand as BTDeleteRemoteVncCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/commands';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { RemoteVncDeletedEvent, RemoteVncDeletionFailedEvent } from '../../events';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { DeleteRemoteVncCommand } from '../delete-remote-vnc.command';

@CommandHandler(DeleteRemoteVncCommand)
export class DeleteRemoteVncCommandHandler implements ICommandHandler<DeleteRemoteVncCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly remoteVncRepositoryService: RemoteVncRepositoryService,
    ) {}

    public async execute(command: DeleteRemoteVncCommand): Promise<void> {
        await this.commandBus.execute<BTDeleteRemoteVncCommand, void>(
            new BTDeleteRemoteVncCommand(command.transactionId, command.id),
        );

        try {
            await this.remoteVncRepositoryService.deleteById(command.id);

            this.eventBus.publish(new RemoteVncDeletedEvent(command.transactionId, { id: command.id }));
        } catch (error) {
            this.eventBus.publish(
                new RemoteVncDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                }),
            );

            throw error;
        }
    }
}
