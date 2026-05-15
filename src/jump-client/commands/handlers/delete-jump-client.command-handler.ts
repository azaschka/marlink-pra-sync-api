import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteJumpClientCommand as BTDeleteJumpClientCommand } from '../../../beyondtrust-pra-conf-api/jump-client/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpClientDeletedEvent, JumpClientDeletionFailedEvent } from '../../events';
import { JumpClientRepositoryService } from '../../repositories/services/jump-client-repository.service';
import { DeleteJumpClientCommand } from '../delete-jump-client.command';

@CommandHandler(DeleteJumpClientCommand)
export class DeleteJumpClientCommandHandler implements ICommandHandler<DeleteJumpClientCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpClientRepositoryService: JumpClientRepositoryService,
    ) {}

    public async execute(command: DeleteJumpClientCommand): Promise<void> {
        try {
            await this.commandBus.execute<BTDeleteJumpClientCommand, void>(
                new BTDeleteJumpClientCommand(command.transactionId, command.tenantId, command.id),
            );
        } catch (error) {
            if (!(error instanceof HttpException && error.getStatus() === HttpStatus.NOT_FOUND)) {
                throw error;
            }
            console.log(
                `[${command.transactionId}] Jump client ${command.id} not found in BeyondTrust (404) – proceeding with local DB cleanup`,
            );
        }

        try {
            await this.jumpClientRepositoryService.deleteById(command.tenantId, command.id);

            this.eventBus.publish(
                new JumpClientDeletedEvent(command.transactionId, { id: command.id, tenantId: command.tenantId }),
            );
        } catch (error) {
            this.eventBus.publish(
                new JumpClientDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }
}
