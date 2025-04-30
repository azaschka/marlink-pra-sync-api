import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand as BTDeleteUserCommand } from '../../../beyondtrust-pra-conf-api/user/commands';
import { UserDeletedEvent } from '../../events';
import { DeleteUserCommand } from '../delete-user.command';

@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler implements ICommandHandler<DeleteUserCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
    ) {}

    public async execute(command: DeleteUserCommand): Promise<void> {
        await this.commandBus.execute<BTDeleteUserCommand, void>(
            new BTDeleteUserCommand(command.transactionId, command.userId),
        );

        this.eventBus.publish(new UserDeletedEvent(command.transactionId, { id: command.userId }));
    }
}
