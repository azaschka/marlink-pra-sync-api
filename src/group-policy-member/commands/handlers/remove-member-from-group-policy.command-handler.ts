import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RemoveMemberFromGroupPolicyCommand as BTRemoveMemberFromGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyMemberRemovalFailedEvent, GroupPolicyMemberRemovedEvent } from '../../events';
import { GroupPolicyMemberRepositoryService } from '../../repositories/services/group-policy-member-repository.service';
import { RemoveMemberFromGroupPolicyCommand } from '../remove-member-from-group-policy.command';

@CommandHandler(RemoveMemberFromGroupPolicyCommand)
export class RemoveMemberFromGroupPolicyCommandHandler implements ICommandHandler<RemoveMemberFromGroupPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService,
    ) {}

    public async execute(command: RemoveMemberFromGroupPolicyCommand): Promise<void> {
        await this.removeBTGroupPolicyMember(command);

        try {
            await this.removeGroupPolicyMember(command.tenantId, command.id, command.memberId);

            this.eventBus.publish(
                new GroupPolicyMemberRemovedEvent(command.transactionId, {
                    groupPolicyId: command.id,
                    memberId: command.memberId,
                    tenantId: command.tenantId,
                }),
            );
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyMemberRemovalFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    groupPolicyId: command.id,
                    memberId: command.memberId,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async removeBTGroupPolicyMember(command: RemoveMemberFromGroupPolicyCommand) {
        await this.commandBus.execute<BTRemoveMemberFromGroupPolicyCommand, void>(
            new BTRemoveMemberFromGroupPolicyCommand(command.transactionId, command.id, command.memberId),
        );
    }

    private async removeGroupPolicyMember(tenantId: number, groupPolicyId: number, memberId: number): Promise<void> {
        await this.groupPolicyMemberRepositoryService.deleteByGroupPolicyIdAndMemberId(
            tenantId,
            groupPolicyId,
            memberId,
        );
    }
}
