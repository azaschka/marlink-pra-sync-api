import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AddJumpointToGroupPolicyCommand as BTAddJumpointToGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { JumpointAddedToGroupPolicyDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyJumpointAddedEvent, GroupPolicyJumpointAdditionFailedEvent } from '../../events';
import { GroupPolicyJumpoint } from '../../models';
import { GroupPolicyJumpointEntity } from '../../repositories/entities';
import { GroupPolicyJumpointRepositoryService } from '../../repositories/services/group-policy-jumpoint-repository.service';
import { AddJumpointToGroupPolicyCommand } from '../add-jumpoint-to-group-policy.command';

@CommandHandler(AddJumpointToGroupPolicyCommand)
export class AddJumpointToGroupPolicyCommandHandler implements ICommandHandler<AddJumpointToGroupPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyJumpointRepositoryService: GroupPolicyJumpointRepositoryService,
    ) {}

    public async execute(command: AddJumpointToGroupPolicyCommand): Promise<GroupPolicyJumpoint> {
        const btGroupPolicyJumpoint = await this.addBTGroupPolicyJumpoint(command);
        const groupPolicyJumpointEntity = this.createGroupPolicyJumpointEntity(command.id, btGroupPolicyJumpoint);

        try {
            const groupPolicyJumpoint = await this.addGroupPolicyJumpoint(command.tenantId, groupPolicyJumpointEntity);

            this.eventBus.publish(
                new GroupPolicyJumpointAddedEvent(command.transactionId, {
                    groupPolicyJumpoint: groupPolicyJumpoint,
                    tenantId: command.tenantId,
                }),
            );

            return groupPolicyJumpoint;
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyJumpointAdditionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    groupPolicyJumpoint: groupPolicyJumpointEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async addBTGroupPolicyJumpoint(command: AddJumpointToGroupPolicyCommand) {
        return await this.commandBus.execute<BTAddJumpointToGroupPolicyCommand, JumpointAddedToGroupPolicyDtoOutput>(
            new BTAddJumpointToGroupPolicyCommand(command.transactionId, command.id, command.jumpointId),
        );
    }

    private createGroupPolicyJumpointEntity(
        groupPolicyId: number,
        btGroupPolicyJumpoint: JumpointAddedToGroupPolicyDtoOutput,
    ) {
        return GroupPolicyJumpointEntity.create(groupPolicyId, btGroupPolicyJumpoint.jumpointId);
    }

    private async addGroupPolicyJumpoint(
        tenantId: number,
        groupPolicyJumpointEntity: GroupPolicyJumpointEntity,
    ): Promise<GroupPolicyJumpoint> {
        await this.groupPolicyJumpointRepositoryService.create(tenantId, groupPolicyJumpointEntity);

        return {
            groupPolicyId: groupPolicyJumpointEntity.groupPolicyId,
            jumpointId: groupPolicyJumpointEntity.jumpointId,
            lastSyncDate: groupPolicyJumpointEntity.lastSyncDate,
        };
    }
}
