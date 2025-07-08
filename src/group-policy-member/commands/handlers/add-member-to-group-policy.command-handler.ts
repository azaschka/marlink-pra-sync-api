import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AddMemberToGroupPolicyCommand as BTAddMemberToGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { MemberAddedToGroupPolicyDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
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
    ) {}

    public async execute(command: AddMemberToGroupPolicyCommand): Promise<GroupPolicyMember> {
        const btGroupPolicyMember = await this.addBTGroupPolicyMember(command);
        const groupPolicyMemberEntity = this.createGroupPolicyMemberEntity(command.id, btGroupPolicyMember);

        try {
            const groupPolicyMember = await this.addGroupPolicyMember(groupPolicyMemberEntity);

            this.eventBus.publish(
                new GroupPolicyMemberAddedEvent(command.transactionId, {
                    groupPolicyMember: groupPolicyMember,
                }),
            );

            return groupPolicyMember;
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyMemberAdditionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    groupPolicyMember: groupPolicyMemberEntity,
                }),
            );

            throw error;
        }
    }

    private async addBTGroupPolicyMember(command: AddMemberToGroupPolicyCommand) {
        return await this.commandBus.execute<BTAddMemberToGroupPolicyCommand, MemberAddedToGroupPolicyDtoOutput>(
            new BTAddMemberToGroupPolicyCommand(
                command.transactionId,
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

    private async addGroupPolicyMember(groupPolicyMemberEntity: GroupPolicyMemberEntity): Promise<GroupPolicyMember> {
        await this.groupPolicyMemberRepositoryService.create(groupPolicyMemberEntity);

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
}
