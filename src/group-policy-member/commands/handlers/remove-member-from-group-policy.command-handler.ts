import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RemoveMemberFromGroupPolicyCommand as BTRemoveMemberFromGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UserGroupPolicyService } from '../../../user-group-policy/services/user-group-policy.service';
import { GroupPolicyMemberRemovalFailedEvent, GroupPolicyMemberRemovedEvent } from '../../events';
import { GroupPolicyMemberRepositoryService } from '../../repositories/services/group-policy-member-repository.service';
import { RemoveMemberFromGroupPolicyCommand } from '../remove-member-from-group-policy.command';

@CommandHandler(RemoveMemberFromGroupPolicyCommand)
export class RemoveMemberFromGroupPolicyCommandHandler implements ICommandHandler<RemoveMemberFromGroupPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService,
        private readonly userGroupPolicyService: UserGroupPolicyService,
    ) {}

    public async execute(command: RemoveMemberFromGroupPolicyCommand): Promise<void> {
        await this.removeBTGroupPolicyMember(command);

        // The command carries the member id only; the user id is read from the mirror row before it is deleted.
        const userId = await this.findMemberUserId(command);

        try {
            await this.removeGroupPolicyMember(command.tenantId, command.id, command.memberId);
            await this.removeUserGroupPolicy(command, userId);

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
            new BTRemoveMemberFromGroupPolicyCommand(
                command.transactionId,
                command.tenantId,
                command.id,
                command.memberId,
            ),
        );
    }

    private async removeGroupPolicyMember(tenantId: number, groupPolicyId: number, memberId: number): Promise<void> {
        await this.groupPolicyMemberRepositoryService.deleteByGroupPolicyIdAndMemberId(
            tenantId,
            groupPolicyId,
            memberId,
        );
    }

    /**
     * User id of the member, or null for a member that is not in the mirror yet, a member without a user id
     * (identity provider group) or a failed read. Best effort, like the update that uses it.
     */
    private async findMemberUserId(command: RemoveMemberFromGroupPolicyCommand): Promise<number | null> {
        try {
            const member = await this.groupPolicyMemberRepositoryService.findOneByGroupPolicyIdAndMemberId(
                command.tenantId,
                command.id,
                command.memberId,
            );

            return typeof member?.userId === 'number' ? member.userId : null;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.warn(
                `⚠️ [${command.transactionId}] tenant ${command.tenantId}: member ${command.memberId} of group policy ${command.id} could not be read from the mirror, the user group policy mirror is left to the next scan: ${errorMessage}`,
            );

            return null;
        }
    }

    /**
     * Counterpart of the update in AddMemberToGroupPolicyCommandHandler (MARLINKPRA-80): the user's group policy
     * list shows the removal at once. Best effort: BeyondTrust has removed the member already, so a failure is
     * logged and the next scan repairs the mirror.
     */
    private async removeUserGroupPolicy(command: RemoveMemberFromGroupPolicyCommand, userId: number | null) {
        if (userId === null) {
            return;
        }

        try {
            await this.userGroupPolicyService.deleteByUserIdAndGroupPolicyId(command.tenantId, userId, command.id);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.warn(
                `⚠️ [${command.transactionId}] tenant ${command.tenantId}: user ${userId} was removed from group policy ${command.id}, but the user group policy mirror was not updated; the next scan repairs it: ${errorMessage}`,
            );
        }
    }
}
