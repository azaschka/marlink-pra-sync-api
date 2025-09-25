import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteRemoteRdpCommand as BTDeleteRemoteRdpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/commands';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { RemoteRdpDeletedEvent, RemoteRdpDeletionFailedEvent } from '../../events';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';
import { DeleteRemoteRdpCommand } from '../delete-remote-rdp.command';

@CommandHandler(DeleteRemoteRdpCommand)
export class DeleteRemoteRdpCommandHandler implements ICommandHandler<DeleteRemoteRdpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly remoteRdpRepositoryService: RemoteRdpRepositoryService,
    ) {}

    public async execute(command: DeleteRemoteRdpCommand): Promise<void> {
        await this.commandBus.execute<BTDeleteRemoteRdpCommand, void>(
            new BTDeleteRemoteRdpCommand(command.transactionId, command.tenantId, command.id),
        );

        try {
            await this.remoteRdpRepositoryService.deleteById(command.tenantId, command.id);

            this.eventBus.publish(
                new RemoteRdpDeletedEvent(command.transactionId, { id: command.id, tenantId: command.tenantId }),
            );
        } catch (error) {
            this.eventBus.publish(
                new RemoteRdpDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }
}
