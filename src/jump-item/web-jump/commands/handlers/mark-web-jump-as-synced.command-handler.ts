import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../../shared/utilities';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { MarkWebJumpAsSyncedCommand } from '../mark-web-jump-as-synced.command';

@CommandHandler(MarkWebJumpAsSyncedCommand)
export class MarkWebJumpAsSyncedCommandHandler implements ICommandHandler<MarkWebJumpAsSyncedCommand> {
    constructor(private readonly webJumpRepositoryService: WebJumpRepositoryService) {}

    public async execute(command: MarkWebJumpAsSyncedCommand): Promise<void> {
        const webJump = await this.webJumpRepositoryService.findOneById(command.tenantId, command.id);

        if (!webJump) {
            throw new NotFoundException(`Web jump with ID "${command.id}" not found.`);
        }

        webJump.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.webJumpRepositoryService.createOrUpdateById(command.tenantId, webJump);
    }
}
