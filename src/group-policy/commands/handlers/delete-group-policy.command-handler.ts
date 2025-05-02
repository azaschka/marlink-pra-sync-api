import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteGroupPolicyCommand as BTDeleteGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { GroupPolicyDeletedEvent } from '../../events';
import { DeleteGroupPolicyCommand } from '../delete-group-policy.command';

@CommandHandler(DeleteGroupPolicyCommand)
export class DeleteGroupPolicyCommandHandler implements ICommandHandler<DeleteGroupPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
    ) {}

    public async execute(command: DeleteGroupPolicyCommand): Promise<void> {
        await this.commandBus.execute<BTDeleteGroupPolicyCommand, void>(
            new BTDeleteGroupPolicyCommand(command.transactionId, command.id),
        );

        this.eventBus.publish(new GroupPolicyDeletedEvent(command.transactionId, { id: command.id }));
    }
}
