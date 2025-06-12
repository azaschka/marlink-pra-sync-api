import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RemoveJumpointFromGroupPolicyCommand as BTRemoveJumpointFromGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyJumpointRemovalFailedEvent, GroupPolicyJumpointRemovedEvent } from '../../events';
import { GroupPolicyJumpointRepositoryService } from '../../repositories/services/group-policy-jumpoint-repository.service';
import { RemoveJumpointFromGroupPolicyCommand } from '../remove-jumpoint-from-group-policy.command';

@CommandHandler(RemoveJumpointFromGroupPolicyCommand)
export class RemoveJumpointFromGroupPolicyCommandHandler
    implements ICommandHandler<RemoveJumpointFromGroupPolicyCommand>
{
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyJumpointRepositoryService: GroupPolicyJumpointRepositoryService,
    ) {}

    public async execute(command: RemoveJumpointFromGroupPolicyCommand): Promise<void> {
        await this.removeBTGroupPolicyJumpoint(command);

        try {
            await this.removeGroupPolicyJumpoint(command.id, command.jumpointId);

            this.eventBus.publish(
                new GroupPolicyJumpointRemovedEvent(command.transactionId, {
                    groupPolicyId: command.id,
                    jumpointId: command.jumpointId,
                }),
            );
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyJumpointRemovalFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    groupPolicyId: command.id,
                    jumpointId: command.jumpointId,
                }),
            );

            throw error;
        }
    }

    private async removeBTGroupPolicyJumpoint(command: RemoveJumpointFromGroupPolicyCommand) {
        await this.commandBus.execute<BTRemoveJumpointFromGroupPolicyCommand, void>(
            new BTRemoveJumpointFromGroupPolicyCommand(command.transactionId, command.id, command.jumpointId),
        );
    }

    private async removeGroupPolicyJumpoint(groupPolicyId: number, jumpointId: number): Promise<void> {
        await this.groupPolicyJumpointRepositoryService.deleteByGroupPolicyIdAndJumpointId(groupPolicyId, jumpointId);
    }
}
