import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { MarkJumpGroupAsSyncedCommand } from '../mark-jump-group-as-synced.command';

@CommandHandler(MarkJumpGroupAsSyncedCommand)
export class MarkJumpGroupAsSyncedCommandHandler implements ICommandHandler<MarkJumpGroupAsSyncedCommand> {
    constructor(private readonly jumpGroupRepositoryService: JumpGroupRepositoryService) {}

    public async execute(command: MarkJumpGroupAsSyncedCommand): Promise<void> {
        const jumpGroup = await this.jumpGroupRepositoryService.findOneById(command.tenantId, command.id);

        if (!jumpGroup) {
            throw new NotFoundException(`Jump group with ID "${command.id}" not found.`);
        }

        jumpGroup.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.jumpGroupRepositoryService.createOrUpdateById(command.tenantId, jumpGroup);
    }
}
