import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AddJumpGroupToGroupPolicyCommand as BTAddJumpGroupToGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { JumpGroupAddedToGroupPolicyDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyJumpGroupAddedEvent, GroupPolicyJumpGroupAdditionFailedEvent } from '../../events';
import { GroupPolicyJumpGroup } from '../../models';
import { GroupPolicyJumpGroupEntity } from '../../repositories/entities';
import { GroupPolicyJumpGroupRepositoryService } from '../../repositories/services/group-policy-jump-group-repository.service';
import { AddJumpGroupToGroupPolicyCommand } from '../add-jump-group-to-group-policy.command';

@CommandHandler(AddJumpGroupToGroupPolicyCommand)
export class AddJumpGroupToGroupPolicyCommandHandler implements ICommandHandler<AddJumpGroupToGroupPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyJumpGroupRepositoryService: GroupPolicyJumpGroupRepositoryService,
    ) {}

    public async execute(command: AddJumpGroupToGroupPolicyCommand): Promise<GroupPolicyJumpGroup> {
        const btGroupPolicyJumpGroup = await this.addBTGroupPolicyJumpGroup(command);
        const groupPolicyJumpGroupEntity = this.createGroupPolicyJumpGroupEntity(command.id, btGroupPolicyJumpGroup);

        try {
            const groupPolicyJumpGroup = await this.addGroupPolicyJumpGroup(groupPolicyJumpGroupEntity);

            this.eventBus.publish(
                new GroupPolicyJumpGroupAddedEvent(command.transactionId, {
                    groupPolicyJumpGroup: groupPolicyJumpGroup,
                }),
            );

            return groupPolicyJumpGroup;
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyJumpGroupAdditionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    groupPolicyJumpGroup: groupPolicyJumpGroupEntity,
                }),
            );

            throw error;
        }
    }

    private async addBTGroupPolicyJumpGroup(command: AddJumpGroupToGroupPolicyCommand) {
        return await this.commandBus.execute<BTAddJumpGroupToGroupPolicyCommand, JumpGroupAddedToGroupPolicyDtoOutput>(
            new BTAddJumpGroupToGroupPolicyCommand(
                command.transactionId,
                command.id,
                command.jumpGroupId,
                command.jumpItemRoleId,
                command.jumpPolicyId,
            ),
        );
    }

    private createGroupPolicyJumpGroupEntity(
        groupPolicyId: number,
        btGroupPolicyJumpGroup: JumpGroupAddedToGroupPolicyDtoOutput,
    ) {
        return GroupPolicyJumpGroupEntity.create(
            groupPolicyId,
            btGroupPolicyJumpGroup.jumpGroupId,
            btGroupPolicyJumpGroup.jumpItemRoleId,
            btGroupPolicyJumpGroup.jumpPolicyId,
        );
    }

    private async addGroupPolicyJumpGroup(
        groupPolicyJumpGroupEntity: GroupPolicyJumpGroupEntity,
    ): Promise<GroupPolicyJumpGroup> {
        await this.groupPolicyJumpGroupRepositoryService.create(groupPolicyJumpGroupEntity);

        return {
            groupPolicyId: groupPolicyJumpGroupEntity.groupPolicyId,
            jumpGroupId: groupPolicyJumpGroupEntity.jumpGroupId,
            jumpItemRoleId: groupPolicyJumpGroupEntity.jumpItemRoleId,
            jumpPolicyId: groupPolicyJumpGroupEntity.jumpPolicyId,
        };
    }
}
