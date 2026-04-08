import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../../shared/utilities';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { MarkProtocolTunnelJumpAsSyncedCommand } from '../mark-protocol-tunnel-jump-as-synced.command';

@CommandHandler(MarkProtocolTunnelJumpAsSyncedCommand)
export class MarkProtocolTunnelJumpAsSyncedCommandHandler implements ICommandHandler<MarkProtocolTunnelJumpAsSyncedCommand> {
    constructor(private readonly protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService) {}

    public async execute(command: MarkProtocolTunnelJumpAsSyncedCommand): Promise<void> {
        const protocolTunnelJump = await this.protocolTunnelJumpRepositoryService.findOneById(
            command.tenantId,
            command.id,
        );

        if (!protocolTunnelJump) {
            throw new NotFoundException(`Protocol tunnel jump with ID "${command.id}" not found.`);
        }

        protocolTunnelJump.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.protocolTunnelJumpRepositoryService.createOrUpdateById(command.tenantId, protocolTunnelJump);
    }
}
