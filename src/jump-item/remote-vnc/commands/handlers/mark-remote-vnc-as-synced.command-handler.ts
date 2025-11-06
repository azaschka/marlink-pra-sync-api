import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../../shared/utilities';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { MarkRemoteVncAsSyncedCommand } from '../mark-remote-vnc-as-synced.command';

@CommandHandler(MarkRemoteVncAsSyncedCommand)
export class MarkRemoteVncAsSyncedCommandHandler implements ICommandHandler<MarkRemoteVncAsSyncedCommand> {
    constructor(private readonly remoteVncRepositoryService: RemoteVncRepositoryService) {}

    public async execute(command: MarkRemoteVncAsSyncedCommand): Promise<void> {
        const remoteVnc = await this.remoteVncRepositoryService.findOneById(command.tenantId, command.id);

        if (!remoteVnc) {
            throw new NotFoundException(`Remote VNC with ID "${command.id}" not found.`);
        }

        remoteVnc.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.remoteVncRepositoryService.createOrUpdateById(command.tenantId, remoteVnc);
    }
}
