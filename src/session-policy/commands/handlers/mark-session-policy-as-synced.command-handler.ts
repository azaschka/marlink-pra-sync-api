import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { SessionPolicyRepositoryService } from '../../repositories/services/session-policy-repository.service';
import { MarkSessionPolicyAsSyncedCommand } from '../mark-session-policy-as-synced.command';

@CommandHandler(MarkSessionPolicyAsSyncedCommand)
export class MarkSessionPolicyAsSyncedCommandHandler implements ICommandHandler<MarkSessionPolicyAsSyncedCommand> {
    constructor(private readonly sessionPolicyRepositoryService: SessionPolicyRepositoryService) {}

    public async execute(command: MarkSessionPolicyAsSyncedCommand): Promise<void> {
        const sessionPolicy = await this.sessionPolicyRepositoryService.findOneById(command.tenantId, command.id);

        if (!sessionPolicy) {
            throw new NotFoundException(`SessionPolicy with ID "${command.id}" not found.`);
        }

        sessionPolicy.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.sessionPolicyRepositoryService.createOrUpdateById(command.tenantId, sessionPolicy);
    }
}
