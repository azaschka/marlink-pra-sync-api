import { HttpException, HttpStatus } from '@nestjs/common';
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
        try {
            await this.commandBus.execute<BTDeleteRemoteVncCommand, void>(
                new BTDeleteRemoteVncCommand(command.transactionId, command.tenantId, command.id),
            );
        } catch (error) {
            if (!(error instanceof HttpException && error.getStatus() === HttpStatus.NOT_FOUND)) {
                throw error;
            }
            console.log(
                `[${command.transactionId}] Remote VNC ${command.id} not found in BeyondTrust (404) – proceeding with local DB cleanup`,
            );
        }

        try {
            await this.remoteVncRepositoryService.deleteById(command.tenantId, command.id);

            this.eventBus.publish(
                new RemoteVncDeletedEvent(command.transactionId, { id: command.id, tenantId: command.tenantId }),
            );
        } catch (error) {
            this.eventBus.publish(
                new RemoteVncDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }
}
