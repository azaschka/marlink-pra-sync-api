import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteProtocolTunnelJumpCommand as BTDeleteProtocolTunnelJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/commands';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { ProtocolTunnelJumpDeletedEvent, ProtocolTunnelJumpDeletionFailedEvent } from '../../events';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { DeleteProtocolTunnelJumpCommand } from '../delete-protocol-tunnel-jump.command';

@CommandHandler(DeleteProtocolTunnelJumpCommand)
export class DeleteProtocolTunnelJumpCommandHandler implements ICommandHandler<DeleteProtocolTunnelJumpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService,
    ) {}

    public async execute(command: DeleteProtocolTunnelJumpCommand): Promise<void> {
        await this.commandBus.execute<BTDeleteProtocolTunnelJumpCommand, void>(
            new BTDeleteProtocolTunnelJumpCommand(command.transactionId, command.id),
        );

        try {
            await this.protocolTunnelJumpRepositoryService.deleteById(command.tenantId, command.id);

            this.eventBus.publish(new ProtocolTunnelJumpDeletedEvent(command.transactionId, { id: command.id }));
        } catch (error) {
            this.eventBus.publish(
                new ProtocolTunnelJumpDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                }),
            );

            throw error;
        }
    }
}
