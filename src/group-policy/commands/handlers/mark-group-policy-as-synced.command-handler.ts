import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { MarkGroupPolicyAsSyncedCommand } from '../mark-group-policy-as-synced.command';

@CommandHandler(MarkGroupPolicyAsSyncedCommand)
export class MarkGroupPolicyAsSyncedCommandHandler implements ICommandHandler<MarkGroupPolicyAsSyncedCommand> {
    constructor(private readonly groupPolicyRepositoryService: GroupPolicyRepositoryService) {}

    public async execute(command: MarkGroupPolicyAsSyncedCommand): Promise<void> {
        const groupPolicy = await this.groupPolicyRepositoryService.findOneById(command.tenantId, command.id);

        if (!groupPolicy) {
            throw new NotFoundException(`Group policy with ID "${command.id}" not found.`);
        }

        groupPolicy.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.groupPolicyRepositoryService.createOrUpdateById(command.tenantId, groupPolicy);
    }
}
