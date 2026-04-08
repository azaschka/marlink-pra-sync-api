import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { JumpClientInstallerRepositoryService } from '../../repositories/services/jump-client-installer-repository.service';
import { MarkJumpClientInstallerAsSyncedCommand } from '../mark-jump-client-installer-as-synced.command';

@CommandHandler(MarkJumpClientInstallerAsSyncedCommand)
export class MarkJumpClientInstallerAsSyncedCommandHandler implements ICommandHandler<MarkJumpClientInstallerAsSyncedCommand> {
    constructor(private readonly jumpClientInstallerRepositoryService: JumpClientInstallerRepositoryService) {}

    public async execute(command: MarkJumpClientInstallerAsSyncedCommand): Promise<void> {
        const jumpClientInstaller = await this.jumpClientInstallerRepositoryService.findOneById(
            command.tenantId,
            command.id,
        );

        if (!jumpClientInstaller) {
            throw new NotFoundException(`Jump client installer with ID "${command.id}" not found.`);
        }

        jumpClientInstaller.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.jumpClientInstallerRepositoryService.createOrUpdateById(command.tenantId, jumpClientInstaller);
    }
}
