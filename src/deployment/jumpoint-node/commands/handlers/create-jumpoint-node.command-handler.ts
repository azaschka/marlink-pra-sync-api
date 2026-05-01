import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateNodeCommand } from '../../../../service-manager-api/nodes/commands';
import { NodeCreatedDtoOutput } from '../../../../service-manager-api/nodes/dtos/outputs';
import { HypervisorType as SMHypervisorType } from '../../../../service-manager-api/nodes/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpointNodeCreatedEvent, JumpointNodeCreationFailedEvent } from '../../events';
import {
    mapFromSmBusinessUnitFullName,
    mapFromSMHypervisorType,
    mapToSMBusinessUnit,
    mapToSMHypervisorType,
} from '../../mappers';
import { JumpointNode } from '../../models';
import { JumpointNodeEntity } from '../../repositories/entities';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { CreateJumpointNodeCommand } from '../create-jumpoint-node.command';

@CommandHandler(CreateJumpointNodeCommand)
export class CreateJumpointNodeCommandHandler implements ICommandHandler<CreateJumpointNodeCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpointNodeRepositoryService: JumpointNodeRepositoryService,
    ) {}

    public async execute(command: CreateJumpointNodeCommand): Promise<JumpointNode> {
        // TODO: Remove dummy fallbacks once the Service Manager API marks hypervisorId,
        //       hypervisorType, and vmId as truly optional (currently still required by SM API).
        const createdNode = await this.commandBus.execute<CreateNodeCommand, NodeCreatedDtoOutput>(
            new CreateNodeCommand(
                command.transactionId,
                command.siteKey,
                mapToSMBusinessUnit(command.businessUnit),
                command.hypervisorId ?? '1',
                command.hypervisorType ? mapToSMHypervisorType(command.hypervisorType) : SMHypervisorType.OneEdge,
                command.vmId ?? 1,
            ),
        );

        try {
            const jumpointNode = await this.jumpointNodeRepositoryService.create(
                JumpointNodeEntity.createWithoutId(
                    createdNode.certname,
                    mapFromSmBusinessUnitFullName(createdNode.businessUnit),
                    createdNode.siteId,
                    createdNode.status,
                    createdNode.puppetServerDomain,
                    createdNode.hypervisorId,
                    createdNode.hypervisorType ? mapFromSMHypervisorType(createdNode.hypervisorType) : undefined,
                    createdNode.customerName,
                    createdNode.vmId,
                    undefined,
                    undefined,
                    undefined,
                ),
            );

            this.eventBus.publish(new JumpointNodeCreatedEvent(command.transactionId, { jumpointNode: jumpointNode }));

            return jumpointNode;
        } catch (error) {
            this.eventBus.publish(
                new JumpointNodeCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    siteKey: command.siteKey,
                    businessUnit: command.businessUnit,
                    hypervisorId: command.hypervisorId,
                    hypervisorType: command.hypervisorType,
                    vmId: command.vmId,
                }),
            );

            throw error;
        }
    }
}
