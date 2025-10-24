import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { MarkJumpointNodeAsSyncedCommand } from '../mark-jumpoint-node-as-synced.command';

@CommandHandler(MarkJumpointNodeAsSyncedCommand)
export class MarkJumpointNodeAsSyncedCommandHandler implements ICommandHandler<MarkJumpointNodeAsSyncedCommand> {
    constructor(private readonly jumpointNodeRepositoryService: JumpointNodeRepositoryService) {}

    public async execute(command: MarkJumpointNodeAsSyncedCommand): Promise<void> {
        const jumpointNode = await this.jumpointNodeRepositoryService.findOneBy(command.tenantId, {
            jumpointId: command.jumpointId,
            id: command.jumpointNodeId,
        });

        if (!jumpointNode) {
            throw new NotFoundException(
                `Jumpoint node with jumpoint ID "${command.jumpointId}" and ID "${command.jumpointNodeId}" not found.`,
            );
        }

        jumpointNode.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.jumpointNodeRepositoryService.createOrUpdateByIdAndJumpointId(command.tenantId, [jumpointNode]);
    }
}
