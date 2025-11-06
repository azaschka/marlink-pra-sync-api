import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { MarkJumpointAsSyncedCommand } from '../mark-jumpoint-as-synced.command';

@CommandHandler(MarkJumpointAsSyncedCommand)
export class MarkJumpointAsSyncedCommandHandler implements ICommandHandler<MarkJumpointAsSyncedCommand> {
    constructor(private readonly jumpointRepositoryService: JumpointRepositoryService) {}

    public async execute(command: MarkJumpointAsSyncedCommand): Promise<void> {
        const jumpoint = await this.jumpointRepositoryService.findOneById(command.tenantId, command.id);

        if (!jumpoint) {
            throw new NotFoundException(`Jumpoint with ID "${command.id}" not found.`);
        }

        jumpoint.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.jumpointRepositoryService.createOrUpdateById(command.tenantId, jumpoint);
    }
}
