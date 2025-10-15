import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../../shared/utilities';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { MarkShellJumpAsSyncedCommand } from '../mark-shell-jump-as-synced.command';

@CommandHandler(MarkShellJumpAsSyncedCommand)
export class MarkShellJumpAsSyncedCommandHandler implements ICommandHandler<MarkShellJumpAsSyncedCommand> {
    constructor(private readonly shellJumpRepositoryService: ShellJumpRepositoryService) {}

    public async execute(command: MarkShellJumpAsSyncedCommand): Promise<void> {
        const shellJump = await this.shellJumpRepositoryService.findOneById(command.tenantId, command.id);

        if (!shellJump) {
            throw new NotFoundException(`Shell jump with ID "${command.id}" not found.`);
        }

        shellJump.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.shellJumpRepositoryService.createOrUpdateById(command.tenantId, shellJump);
    }
}
