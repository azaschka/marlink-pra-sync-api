import { NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateNodeServiceCommand } from '../../../service-manager-api/nodes/commands';
import { NodeServiceCreatedDtoOutput } from '../../../service-manager-api/nodes/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpointNodeServiceCreatedEvent, JumpointNodeServiceCreationFailedEvent } from '../../events';
import { mapToSMNodeServiceType } from '../../mappers';
import { JumpointNode } from '../../models';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { CreateJumpointNodeServiceCommand } from '../create-jumpoint-node-service.command';

@CommandHandler(CreateJumpointNodeServiceCommand)
export class CreateJumpointNodeServiceCommandHandler implements ICommandHandler<CreateJumpointNodeServiceCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpointNodeRepositoryService: JumpointNodeRepositoryService,
    ) {}

    public async execute(command: CreateJumpointNodeServiceCommand): Promise<JumpointNode> {
        const jumpointNode = await this.jumpointNodeRepositoryService.findOneById(command.id);

        if (!jumpointNode) {
            throw new NotFoundException(`Jumpoint Node with ID ${command.id} not found.`);
        }

        await this.commandBus.execute<CreateNodeServiceCommand, NodeServiceCreatedDtoOutput>(
            new CreateNodeServiceCommand(
                command.transactionId,
                jumpointNode.certname,
                mapToSMNodeServiceType(command.serviceType),
            ),
        );

        try {
            jumpointNode.serviceType = command.serviceType;

            await this.jumpointNodeRepositoryService.createOrUpdateById(jumpointNode);

            this.eventBus.publish(
                new JumpointNodeServiceCreatedEvent(command.transactionId, { jumpointNode: jumpointNode }),
            );

            return jumpointNode;
        } catch (error) {
            this.eventBus.publish(
                new JumpointNodeServiceCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    id: command.id,
                    serviceType: command.serviceType,
                }),
            );

            throw error;
        }
    }
}
