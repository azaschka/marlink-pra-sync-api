import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../../shared/utilities';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';
import { MarkRemoteRdpAsSyncedCommand } from '../mark-remote-rdp-as-synced.command';

@CommandHandler(MarkRemoteRdpAsSyncedCommand)
export class MarkRemoteRdpAsSyncedCommandHandler implements ICommandHandler<MarkRemoteRdpAsSyncedCommand> {
    constructor(private readonly remoteRdpRepositoryService: RemoteRdpRepositoryService) {}

    public async execute(command: MarkRemoteRdpAsSyncedCommand): Promise<void> {
        const remoteRdp = await this.remoteRdpRepositoryService.findOneById(command.tenantId, command.id);

        if (!remoteRdp) {
            throw new NotFoundException(`Remote RDP with ID "${command.id}" not found.`);
        }

        remoteRdp.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.remoteRdpRepositoryService.createOrUpdateById(command.tenantId, remoteRdp);
    }
}
