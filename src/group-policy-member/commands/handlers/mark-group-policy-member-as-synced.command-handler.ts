import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { GroupPolicyMemberRepositoryService } from '../../repositories/services/group-policy-member-repository.service';
import { MarkGroupPolicyMemberAsSyncedCommand } from '../mark-group-policy-member-as-synced.command';

@CommandHandler(MarkGroupPolicyMemberAsSyncedCommand)
export class MarkGroupPolicyMemberAsSyncedCommandHandler
    implements ICommandHandler<MarkGroupPolicyMemberAsSyncedCommand>
{
    constructor(private readonly groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService) {}

    public async execute(command: MarkGroupPolicyMemberAsSyncedCommand): Promise<void> {
        const groupPolicyMember = await this.groupPolicyMemberRepositoryService.findOneBy(command.tenantId, {
            groupPolicyId: command.groupPolicyId,
            memberId: command.memberId,
        });

        if (!groupPolicyMember) {
            throw new NotFoundException(
                `Group policy member with group policy ID "${command.groupPolicyId}" and member ID "${command.memberId}" not found.`,
            );
        }

        groupPolicyMember.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.groupPolicyMemberRepositoryService.createOrUpdateByGroupPolicyIdAndMemberId(command.tenantId, [
            groupPolicyMember,
        ]);
    }
}
