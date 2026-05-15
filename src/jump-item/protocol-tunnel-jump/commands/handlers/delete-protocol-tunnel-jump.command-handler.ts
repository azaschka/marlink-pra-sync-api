import { HttpException, HttpStatus } from '@nestjs/common';
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
        try {
            await this.commandBus.execute<BTDeleteProtocolTunnelJumpCommand, void>(
                new BTDeleteProtocolTunnelJumpCommand(command.transactionId, command.tenantId, command.id),
            );
        } catch (error) {
            if (!(error instanceof HttpException && error.getStatus() === HttpStatus.NOT_FOUND)) {
                throw error;
            }
            console.log(
                `[${command.transactionId}] Protocol tunnel jump ${command.id} not found in BeyondTrust (404) – proceeding with local DB cleanup`,
            );
        }

        try {
            await this.protocolTunnelJumpRepositoryService.deleteById(command.tenantId, command.id);

            this.eventBus.publish(
                new ProtocolTunnelJumpDeletedEvent(command.transactionId, {
                    id: command.id,
                    tenantId: command.tenantId,
                }),
            );
        } catch (error) {
            this.eventBus.publish(
                new ProtocolTunnelJumpDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }
}
