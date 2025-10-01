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
        await this.commandBus.execute<BTDeleteJumpClientInstallerCommand, void>(
            new BTDeleteJumpClientInstallerCommand(command.transactionId, command.tenantId, command.id),
        );

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
