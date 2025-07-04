import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RemoveJumpGroupFromGroupPolicyCommand as BTRemoveJumpGroupFromGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyJumpGroupRemovalFailedEvent, GroupPolicyJumpGroupRemovedEvent } from '../../events';
import { GroupPolicyJumpGroupRepositoryService } from '../../repositories/services/group-policy-jump-group-repository.service';
import { RemoveJumpGroupFromGroupPolicyCommand } from '../remove-jump-group-from-group-policy.command';

@CommandHandler(RemoveJumpGroupFromGroupPolicyCommand)
export class RemoveJumpGroupFromGroupPolicyCommandHandler
    implements ICommandHandler<RemoveJumpGroupFromGroupPolicyCommand>
{
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyJumpGroupRepositoryService: GroupPolicyJumpGroupRepositoryService,
    ) {}

    public async execute(command: RemoveJumpGroupFromGroupPolicyCommand): Promise<void> {
        await this.removeBTGroupPolicyJumpGroup(command);

        try {
            await this.removeGroupPolicyJumpGroup(command.id, command.jumpGroupId);

            this.eventBus.publish(
                new GroupPolicyJumpGroupRemovedEvent(command.transactionId, {
                    groupPolicyId: command.id,
                    jumpGroupId: command.jumpGroupId,
                }),
            );
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyJumpGroupRemovalFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    groupPolicyId: command.id,
                    jumpGroupId: command.jumpGroupId,
                }),
            );

            throw error;
        }
    }

    private async removeBTGroupPolicyJumpGroup(command: RemoveJumpGroupFromGroupPolicyCommand) {
        await this.commandBus.execute<BTRemoveJumpGroupFromGroupPolicyCommand, void>(
            new BTRemoveJumpGroupFromGroupPolicyCommand(command.transactionId, command.id, command.jumpGroupId),
        );
    }

    private async removeGroupPolicyJumpGroup(groupPolicyId: number, jumpGroupId: number): Promise<void> {
        await this.groupPolicyJumpGroupRepositoryService.deleteByGroupPolicyIdAndJumpGroupId(
            groupPolicyId,
            jumpGroupId,
        );
    }
}
