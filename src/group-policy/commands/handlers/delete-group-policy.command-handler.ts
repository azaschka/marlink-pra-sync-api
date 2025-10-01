import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteGroupPolicyCommand as BTDeleteGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyDeletedEvent, GroupPolicyDeletionFailedEvent } from '../../events';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { DeleteGroupPolicyCommand } from '../delete-group-policy.command';

@CommandHandler(DeleteGroupPolicyCommand)
export class DeleteGroupPolicyCommandHandler implements ICommandHandler<DeleteGroupPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyRepositoryService: GroupPolicyRepositoryService,
    ) {}

    public async execute(command: DeleteGroupPolicyCommand): Promise<void> {
        await this.commandBus.execute<BTDeleteGroupPolicyCommand, void>(
            new BTDeleteGroupPolicyCommand(command.transactionId, command.tenantId, command.id),
        );

        try {
            await this.groupPolicyRepositoryService.deleteById(command.tenantId, command.id);

            this.eventBus.publish(
                new GroupPolicyDeletedEvent(command.transactionId, { id: command.id, tenantId: command.tenantId }),
            );
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyDeletionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }
}
