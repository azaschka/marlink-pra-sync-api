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
        await this.commandBus.execute<BTDeleteUserCommand, void>(
            new BTDeleteUserCommand(command.transactionId, command.id),
        );

        try {
            await this.userRepositoryService.deleteById(command.id);

            this.eventBus.publish(new UserDeletedEvent(command.transactionId, { id: command.id }));
        } catch (error) {
            this.eventBus.publish(
                new UserDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                }),
            );

            throw error;
        }
    }
}
