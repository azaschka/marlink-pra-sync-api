import { NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ApproveNodeCommand } from '../../../service-manager-api/nodes/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpointNodeApprovalFailedEvent, JumpointNodeApprovedEvent } from '../../events';
import { JumpointNode } from '../../models';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { ApproveJumpointNodeCommand } from '../approve-jumpoint-node.command';

@CommandHandler(ApproveJumpointNodeCommand)
export class ApproveJumpointNodeCommandHandler implements ICommandHandler<ApproveJumpointNodeCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpointNodeRepositoryService: JumpointNodeRepositoryService,
    ) {}

    public async execute(command: ApproveJumpointNodeCommand): Promise<JumpointNode> {
        const jumpointNode = await this.jumpointNodeRepositoryService.findOneById(command.id);

        if (!jumpointNode) {
            throw new NotFoundException(`Jumpoint Node with ID ${command.id} not found.`);
        }

        await this.commandBus.execute<ApproveNodeCommand, void>(
            new ApproveNodeCommand(command.transactionId, jumpointNode.certname),
        );

        try {
            jumpointNode.hasApproval = true;

            await this.jumpointNodeRepositoryService.createOrUpdateById(jumpointNode);

            this.eventBus.publish(new JumpointNodeApprovedEvent(command.transactionId, { jumpointNode: jumpointNode }));

            return jumpointNode;
        } catch (error) {
            this.eventBus.publish(
                new JumpointNodeApprovalFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                }),
            );

            throw error;
        }
    }
}
