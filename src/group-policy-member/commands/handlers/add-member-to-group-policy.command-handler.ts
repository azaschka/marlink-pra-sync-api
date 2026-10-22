import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AddMemberToGroupPolicyCommand as BTAddMemberToGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { MemberAddedToGroupPolicyDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UserGroupPolicyEntity } from '../../../user-group-policy/repositories/entities';
import { UserGroupPolicyService } from '../../../user-group-policy/services/user-group-policy.service';
import { GroupPolicyMemberAddedEvent, GroupPolicyMemberAdditionFailedEvent } from '../../events';
import { GroupPolicyMember } from '../../models';
import { GroupPolicyMemberEntity } from '../../repositories/entities';
import { GroupPolicyMemberRepositoryService } from '../../repositories/services/group-policy-member-repository.service';
import { AddMemberToGroupPolicyCommand } from '../add-member-to-group-policy.command';

@CommandHandler(AddMemberToGroupPolicyCommand)
export class AddMemberToGroupPolicyCommandHandler implements ICommandHandler<AddMemberToGroupPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService,
        private readonly userGroupPolicyService: UserGroupPolicyService,
    ) {}

    public async execute(command: AddMemberToGroupPolicyCommand): Promise<GroupPolicyMember> {
        const btGroupPolicyMember = await this.addBTGroupPolicyMember(command);
        const groupPolicyMemberEntity = this.createGroupPolicyMemberEntity(command.id, btGroupPolicyMember);

        try {
            const groupPolicyMember = await this.addGroupPolicyMember(command.tenantId, groupPolicyMemberEntity);
            await this.addUserGroupPolicy(command, groupPolicyMember);

            this.eventBus.publish(
                new GroupPolicyMemberAddedEvent(command.transactionId, {
                    groupPolicyMember: groupPolicyMember,
                    tenantId: command.tenantId,
                }),
            );

            return groupPolicyMember;
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyMemberAdditionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    groupPolicyMember: groupPolicyMemberEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async addBTGroupPolicyMember(command: AddMemberToGroupPolicyCommand) {
        return await this.commandBus.execute<BTAddMemberToGroupPolicyCommand, MemberAddedToGroupPolicyDtoOutput>(
            new BTAddMemberToGroupPolicyCommand(
                command.transactionId,
                command.tenantId,
                command.id,
                command.userId,
                command.securityProviderId,
                command.distinguishedName,
                command.groupName,
            ),
        );
    }

    private createGroupPolicyMemberEntity(
        groupPolicyId: number,
        btGroupPolicyMember: MemberAddedToGroupPolicyDtoOutput,
    ) {
        return GroupPolicyMemberEntity.create(
            groupPolicyId,
            btGroupPolicyMember.id,
            btGroupPolicyMember.userId,
            btGroupPolicyMember.securityProviderId,
            btGroupPolicyMember.distinguishedName,
            btGroupPolicyMember.groupName,
        );
    }

    private async addGroupPolicyMember(
        tenantId: number,
        groupPolicyMemberEntity: GroupPolicyMemberEntity,
    ): Promise<GroupPolicyMember> {
        await this.groupPolicyMemberRepositoryService.create(tenantId, groupPolicyMemberEntity);

        return {
            groupPolicyId: groupPolicyMemberEntity.groupPolicyId,
            memberId: groupPolicyMemberEntity.memberId,
            userId: groupPolicyMemberEntity.userId,
            securityProviderId: groupPolicyMemberEntity.securityProviderId,
            distinguishedName: groupPolicyMemberEntity.distinguishedName,
            groupName: groupPolicyMemberEntity.groupName,
            lastSyncDate: groupPolicyMemberEntity.lastSyncDate,
        };
    }

    /**
     * The group policy list of a user is read from `user_group_policies`. Without this update a membership added
     * here (the path of non-local users) would show only after the next scan (MARLINKPRA-80). Best effort:
     * BeyondTrust has accepted the member already, so a failure is logged and the next scan repairs the mirror.
     * Members without a user id (identity provider groups) have no user group policy.
     */
    private async addUserGroupPolicy(
        command: AddMemberToGroupPolicyCommand,
        groupPolicyMember: GroupPolicyMember,
    ): Promise<void> {
        const { userId, groupPolicyId } = groupPolicyMember;

        if (typeof userId !== 'number') {
            return;
        }

        try {
            await this.userGroupPolicyService.createOrUpdateByUserIdAndGroupPolicyId(
                command.tenantId,
                UserGroupPolicyEntity.create(userId, groupPolicyId),
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.warn(
                `⚠️ [${command.transactionId}] tenant ${command.tenantId}: user ${userId} was added to group policy ${groupPolicyId}, but the user group policy mirror was not updated; the next scan repairs it: ${errorMessage}`,
            );
        }
    }
}
