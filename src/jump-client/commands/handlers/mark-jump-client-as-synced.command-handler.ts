import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { JumpClientRepositoryService } from '../../repositories/services/jump-client-repository.service';
import { MarkJumpClientAsSyncedCommand } from '../mark-jump-client-as-synced.command';

@CommandHandler(MarkJumpClientAsSyncedCommand)
export class MarkJumpClientAsSyncedCommandHandler implements ICommandHandler<MarkJumpClientAsSyncedCommand> {
    constructor(private readonly jumpClientRepositoryService: JumpClientRepositoryService) {}

    public async execute(command: MarkJumpClientAsSyncedCommand): Promise<void> {
        const jumpClient = await this.jumpClientRepositoryService.findOneById(command.tenantId, command.id);

        if (!jumpClient) {
            throw new NotFoundException(`Jump client with ID "${command.id}" not found.`);
        }

        jumpClient.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.jumpClientRepositoryService.createOrUpdateById(command.tenantId, jumpClient);
    }
}
