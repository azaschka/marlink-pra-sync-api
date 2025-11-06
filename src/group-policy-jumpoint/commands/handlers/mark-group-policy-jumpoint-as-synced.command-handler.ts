import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { GroupPolicyJumpointRepositoryService } from '../../repositories/services/group-policy-jumpoint-repository.service';
import { MarkGroupPolicyJumpointAsSyncedCommand } from '../mark-group-policy-jumpoint-as-synced.command';

@CommandHandler(MarkGroupPolicyJumpointAsSyncedCommand)
export class MarkGroupPolicyJumpointAsSyncedCommandHandler
    implements ICommandHandler<MarkGroupPolicyJumpointAsSyncedCommand>
{
    constructor(private readonly groupPolicyJumpointRepositoryService: GroupPolicyJumpointRepositoryService) {}

    public async execute(command: MarkGroupPolicyJumpointAsSyncedCommand): Promise<void> {
        const groupPolicyJumpoint = await this.groupPolicyJumpointRepositoryService.findOneBy(command.tenantId, {
            groupPolicyId: command.groupPolicyId,
            jumpointId: command.jumpointId,
        });

        if (!groupPolicyJumpoint) {
            throw new NotFoundException(
                `Group policy jumpoint with group policy ID "${command.groupPolicyId}" and jumpoint ID "${command.jumpointId}" not found.`,
            );
        }

        groupPolicyJumpoint.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.groupPolicyJumpointRepositoryService.createOrUpdateByGroupPolicyIdAndJumpointId(command.tenantId, [
            groupPolicyJumpoint,
        ]);
    }
}
