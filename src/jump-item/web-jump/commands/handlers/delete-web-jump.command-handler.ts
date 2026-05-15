import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteWebJumpCommand as BTDeleteWebJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/commands';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { WebJumpDeletedEvent, WebJumpDeletionFailedEvent } from '../../events';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { DeleteWebJumpCommand } from '../delete-web-jump.command';

@CommandHandler(DeleteWebJumpCommand)
export class DeleteWebJumpCommandHandler implements ICommandHandler<DeleteWebJumpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly webJumpRepositoryService: WebJumpRepositoryService,
    ) {}

    public async execute(command: DeleteWebJumpCommand): Promise<void> {
        try {
            await this.commandBus.execute<BTDeleteWebJumpCommand, void>(
                new BTDeleteWebJumpCommand(command.transactionId, command.tenantId, command.id),
            );
        } catch (error) {
            if (!(error instanceof HttpException && error.getStatus() === Number(HttpStatus.NOT_FOUND))) {
                throw error;
            }
            console.log(
                `[${command.transactionId}] Web jump ${command.id} not found in BeyondTrust (404) – proceeding with local DB cleanup`,
            );
        }

        try {
            await this.webJumpRepositoryService.deleteById(command.tenantId, command.id);

            this.eventBus.publish(
                new WebJumpDeletedEvent(command.transactionId, { id: command.id, tenantId: command.tenantId }),
            );
        } catch (error) {
            this.eventBus.publish(
                new WebJumpDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }
}
