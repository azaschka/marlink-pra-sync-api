import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { UserGroupPolicyRepositoryService } from '../../repositories/services/user-group-policy-repository.service';
import { MarkUserGroupPolicyAsSyncedCommand } from '../mark-user-group-policy-as-synced.command';

@CommandHandler(MarkUserGroupPolicyAsSyncedCommand)
export class MarkUserGroupPolicyAsSyncedCommandHandler implements ICommandHandler<MarkUserGroupPolicyAsSyncedCommand> {
    constructor(private readonly userGroupPolicyRepositoryService: UserGroupPolicyRepositoryService) {}

    public async execute(command: MarkUserGroupPolicyAsSyncedCommand): Promise<void> {
        const userGroupPolicy = await this.userGroupPolicyRepositoryService.findOneBy(command.tenantId, {
            userId: command.userId,
            groupPolicyId: command.groupPolicyId,
        });

        if (!userGroupPolicy) {
            throw new NotFoundException(
                `User group policy with user ID "${command.userId}" and group policy ID "${command.groupPolicyId}" not found.`,
            );
        }

        userGroupPolicy.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.userGroupPolicyRepositoryService.createOrUpdateByUserIdAndGroupPolicyId(command.tenantId, [
            userGroupPolicy,
        ]);
    }
}
