import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteJumpointCommand as BTDeleteJumpointCommand } from '../../../beyondtrust-pra-conf-api/jumpoint/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpointDeletedEvent, JumpointDeletionFailedEvent } from '../../events';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { DeleteJumpointCommand } from '../delete-jumpoint.command';

@CommandHandler(DeleteJumpointCommand)
export class DeleteJumpointCommandHandler implements ICommandHandler<DeleteJumpointCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpointRepositoryService: JumpointRepositoryService,
    ) {}

    public async execute(command: DeleteJumpointCommand): Promise<void> {
        try {
            await this.commandBus.execute<BTDeleteJumpointCommand, void>(
                new BTDeleteJumpointCommand(command.transactionId, command.tenantId, command.id),
            );
        } catch (error) {
            if (!(error instanceof HttpException && error.getStatus() === HttpStatus.NOT_FOUND)) {
                throw error;
            }
            console.log(
                `[${command.transactionId}] Jumpoint ${command.id} not found in BeyondTrust (404) – proceeding with local DB cleanup`,
            );
        }

        try {
            await this.jumpointRepositoryService.deleteById(command.tenantId, command.id);

            this.eventBus.publish(
                new JumpointDeletedEvent(command.transactionId, { id: command.id, tenantId: command.tenantId }),
            );
        } catch (error) {
            this.eventBus.publish(
                new JumpointDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }
}
