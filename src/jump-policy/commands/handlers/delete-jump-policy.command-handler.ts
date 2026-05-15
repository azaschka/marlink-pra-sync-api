import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteJumpPolicyCommand as BTDeleteJumpPolicyCommand } from '../../../beyondtrust-pra-conf-api/jump-policy/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpPolicyDeletedEvent, JumpPolicyDeletionFailedEvent } from '../../events';
import { JumpPolicyRepositoryService } from '../../repositories/services/jump-policy-repository.service';
import { DeleteJumpPolicyCommand } from '../delete-jump-policy.command';

@CommandHandler(DeleteJumpPolicyCommand)
export class DeleteJumpPolicyCommandHandler implements ICommandHandler<DeleteJumpPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpPolicyRepositoryService: JumpPolicyRepositoryService,
    ) {}

    public async execute(command: DeleteJumpPolicyCommand): Promise<void> {
        try {
            await this.commandBus.execute<BTDeleteJumpPolicyCommand, void>(
                new BTDeleteJumpPolicyCommand(command.transactionId, command.tenantId, command.id),
            );
        } catch (error) {
            if (!(error instanceof HttpException && error.getStatus() === Number(HttpStatus.NOT_FOUND))) {
                throw error;
            }
            console.log(
                `[${command.transactionId}] Jump policy ${command.id} not found in BeyondTrust (404) – proceeding with local DB cleanup`,
            );
        }

        try {
            await this.jumpPolicyRepositoryService.deleteById(command.tenantId, command.id);

            this.eventBus.publish(
                new JumpPolicyDeletedEvent(command.transactionId, { id: command.id, tenantId: command.tenantId }),
            );
        } catch (error) {
            this.eventBus.publish(
                new JumpPolicyDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }
}
