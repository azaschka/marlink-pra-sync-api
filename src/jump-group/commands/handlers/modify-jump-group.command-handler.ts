import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ModifyJumpGroupCommand as BTModifyJumpGroupCommand } from '../../../beyondtrust-pra-conf-api/jump-group/commands';
import { JumpGroupModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-group/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpGroupModificationFailedEvent, JumpGroupModifiedEvent } from '../../events';
import { JumpGroup } from '../../models';
import { JumpGroupEntity } from '../../repositories/entities';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { ModifyJumpGroupCommand } from '../modify-jump-group.command';

@CommandHandler(ModifyJumpGroupCommand)
export class ModifyJumpGroupCommandHandler implements ICommandHandler<ModifyJumpGroupCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpGroupRepositoryService: JumpGroupRepositoryService,
    ) {}

    public async execute(command: ModifyJumpGroupCommand): Promise<JumpGroup> {
        const btJumpGroup = await this.modifyBTJumpGroup(command);
        const jumpGroupEntity = this.createJumpGroupEntity(btJumpGroup);

        try {
            const updatedJumpGroup = await this.updateJumpGroup(command.tenantId, jumpGroupEntity);

            this.eventBus.publish(
                new JumpGroupModifiedEvent(command.transactionId, {
                    jumpGroup: updatedJumpGroup,
                    tenantId: command.tenantId,
                }),
            );

            return updatedJumpGroup;
        } catch (error) {
            this.eventBus.publish(
                new JumpGroupModificationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    jumpGroup: jumpGroupEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async modifyBTJumpGroup(command: ModifyJumpGroupCommand) {
        return await this.commandBus.execute<BTModifyJumpGroupCommand, JumpGroupModifiedDtoOutput>(
            new BTModifyJumpGroupCommand(
                command.transactionId,
                command.id,
                command.name,
                command.codeName,
                command.comments,
            ),
        );
    }

    private createJumpGroupEntity(btJumpGroup: JumpGroupModifiedDtoOutput) {
        return JumpGroupEntity.create(btJumpGroup.id, btJumpGroup.name, btJumpGroup.codeName, btJumpGroup.comments);
    }

    private async updateJumpGroup(tenantId: number, jumpGroupEntity: JumpGroupEntity) {
        await this.jumpGroupRepositoryService.createOrUpdateById(tenantId, jumpGroupEntity);

        const createdOrUpdatedJumpGroup = await this.jumpGroupRepositoryService.findOneById(
            tenantId,
            jumpGroupEntity.id,
        );

        if (!createdOrUpdatedJumpGroup) {
            throw new Error('Jump Group has been created or updated but could not be retrieved.');
        }

        return createdOrUpdatedJumpGroup;
    }
}
