import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { GroupPolicyJumpGroupRepositoryService } from '../../repositories/services/group-policy-jump-group-repository.service';
import { MarkGroupPolicyJumpGroupAsSyncedCommand } from '../mark-group-policy-jump-group-as-synced.command';

@CommandHandler(MarkGroupPolicyJumpGroupAsSyncedCommand)
export class MarkGroupPolicyJumpGroupAsSyncedCommandHandler
    implements ICommandHandler<MarkGroupPolicyJumpGroupAsSyncedCommand>
{
    constructor(private readonly groupPolicyJumpGroupRepositoryService: GroupPolicyJumpGroupRepositoryService) {}

    public async execute(command: MarkGroupPolicyJumpGroupAsSyncedCommand): Promise<void> {
        const groupPolicyJumpGroup = await this.groupPolicyJumpGroupRepositoryService.findOneBy(command.tenantId, {
            groupPolicyId: command.groupPolicyId,
            jumpGroupId: command.jumpGroupId,
        });

        if (!groupPolicyJumpGroup) {
            throw new NotFoundException(
                `Group policy jump group with group policy ID "${command.groupPolicyId}" and jump group ID "${command.jumpGroupId}" not found.`,
            );
        }

        groupPolicyJumpGroup.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.groupPolicyJumpGroupRepositoryService.createOrUpdateByGroupPolicyIdAndJumpGroupId(command.tenantId, [
            groupPolicyJumpGroup,
        ]);
    }
}
