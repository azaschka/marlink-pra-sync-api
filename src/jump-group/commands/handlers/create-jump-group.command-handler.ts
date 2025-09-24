import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateJumpGroupCommand as BTCreateJumpGroupCommand } from '../../../beyondtrust-pra-conf-api/jump-group/commands';
import { JumpGroupCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-group/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpGroupCreatedEvent, JumpGroupCreationFailedEvent } from '../../events';
import { JumpGroup } from '../../models';
import { JumpGroupEntity } from '../../repositories/entities';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { CreateJumpGroupCommand } from '../create-jump-group.command';

@CommandHandler(CreateJumpGroupCommand)
export class CreateJumpGroupCommandHandler implements ICommandHandler<CreateJumpGroupCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpGroupRepositoryService: JumpGroupRepositoryService,
    ) {}

    public async execute(command: CreateJumpGroupCommand): Promise<JumpGroup> {
        const btJumpGroup = await this.createBTJumpGroup(command);
        const jumpGroupEntity = this.createJumpGroupEntity(btJumpGroup);

        try {
            const createdJumpGroup = await this.jumpGroupRepositoryService.create(command.tenantId, jumpGroupEntity);

            this.eventBus.publish(
                new JumpGroupCreatedEvent(command.transactionId, {
                    jumpGroup: createdJumpGroup,
                    tenantId: command.tenantId,
                }),
            );

            return createdJumpGroup;
        } catch (error) {
            this.eventBus.publish(
                new JumpGroupCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    jumpGroup: jumpGroupEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async createBTJumpGroup(command: CreateJumpGroupCommand) {
        return await this.commandBus.execute<BTCreateJumpGroupCommand, JumpGroupCreatedDtoOutput>(
            new BTCreateJumpGroupCommand(command.transactionId, command.name, command.codeName, command.comments),
        );
    }

    private createJumpGroupEntity(btJumpGroup: JumpGroupCreatedDtoOutput) {
        return JumpGroupEntity.create(btJumpGroup.id, btJumpGroup.name, btJumpGroup.codeName, btJumpGroup.comments);
    }
}
