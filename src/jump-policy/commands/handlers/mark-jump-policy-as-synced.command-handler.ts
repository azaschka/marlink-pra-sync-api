import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { JumpPolicyRepositoryService } from '../../repositories/services/jump-policy-repository.service';
import { MarkJumpPolicyAsSyncedCommand } from '../mark-jump-policy-as-synced.command';

@CommandHandler(MarkJumpPolicyAsSyncedCommand)
export class MarkJumpPolicyAsSyncedCommandHandler implements ICommandHandler<MarkJumpPolicyAsSyncedCommand> {
    constructor(private readonly jumpPolicyRepositoryService: JumpPolicyRepositoryService) {}

    public async execute(command: MarkJumpPolicyAsSyncedCommand): Promise<void> {
        const jumpPolicy = await this.jumpPolicyRepositoryService.findOneById(command.tenantId, command.id);

        if (!jumpPolicy) {
            throw new NotFoundException(`Jump policy with ID "${command.id}" not found.`);
        }

        jumpPolicy.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.jumpPolicyRepositoryService.createOrUpdateById(command.tenantId, jumpPolicy);
    }
}
