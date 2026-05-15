import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteJumpClientInstallerCommand as BTDeleteJumpClientInstallerCommand } from '../../../beyondtrust-pra-conf-api/jump-client/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpClientInstallerDeletedEvent, JumpClientInstallerDeletionFailedEvent } from '../../events';
import { JumpClientInstallerRepositoryService } from '../../repositories/services/jump-client-installer-repository.service';
import { DeleteJumpClientInstallerCommand } from '../delete-jump-client-installer.command';

@CommandHandler(DeleteJumpClientInstallerCommand)
export class DeleteJumpClientInstallerCommandHandler implements ICommandHandler<DeleteJumpClientInstallerCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpClientInstallerRepositoryService: JumpClientInstallerRepositoryService,
    ) {}

    public async execute(command: DeleteJumpClientInstallerCommand): Promise<void> {
        try {
            await this.commandBus.execute<BTDeleteJumpClientInstallerCommand, void>(
                new BTDeleteJumpClientInstallerCommand(command.transactionId, command.tenantId, command.id),
            );
        } catch (error) {
            if (!(error instanceof HttpException && error.getStatus() === Number(HttpStatus.NOT_FOUND))) {
                throw error;
            }
            console.log(
                `[${command.transactionId}] Jump client installer ${command.id} not found in BeyondTrust (404) – proceeding with local DB cleanup`,
            );
        }

        try {
            await this.jumpClientInstallerRepositoryService.deleteById(command.tenantId, command.id);

            this.eventBus.publish(
                new JumpClientInstallerDeletedEvent(command.transactionId, {
                    id: command.id,
                    tenantId: command.tenantId,
                }),
            );
        } catch (error) {
            this.eventBus.publish(
                new JumpClientInstallerDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }
}
