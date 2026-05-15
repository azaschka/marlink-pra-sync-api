import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand as BTDeleteUserCommand } from '../../../beyondtrust-pra-conf-api/user/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UserDeletedEvent, UserDeletionFailedEvent } from '../../events';
import { UserRepositoryService } from '../../repositories/services/user-repository.service';
import { DeleteUserCommand } from '../delete-user.command';

@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler implements ICommandHandler<DeleteUserCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly userRepositoryService: UserRepositoryService,
    ) {}

    public async execute(command: DeleteUserCommand): Promise<void> {
        try {
            await this.commandBus.execute<BTDeleteUserCommand, void>(
                new BTDeleteUserCommand(command.transactionId, command.tenantId, command.id),
            );
        } catch (error) {
            if (!(error instanceof HttpException && error.getStatus() === Number(HttpStatus.NOT_FOUND))) {
                throw error;
            }
            console.log(
                `[${command.transactionId}] User ${command.id} not found in BeyondTrust (404) – proceeding with local DB cleanup`,
            );
        }

        try {
            await this.userRepositoryService.deleteById(command.tenantId, command.id);

            this.eventBus.publish(
                new UserDeletedEvent(command.transactionId, { id: command.id, tenantId: command.tenantId }),
            );
        } catch (error) {
            this.eventBus.publish(
                new UserDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }
}
