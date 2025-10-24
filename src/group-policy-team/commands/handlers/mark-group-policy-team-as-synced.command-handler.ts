import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { GroupPolicyTeamRepositoryService } from '../../repositories/services/group-policy-team-repository.service';
import { MarkGroupPolicyTeamAsSyncedCommand } from '../mark-group-policy-team-as-synced.command';

@CommandHandler(MarkGroupPolicyTeamAsSyncedCommand)
export class MarkGroupPolicyTeamAsSyncedCommandHandler implements ICommandHandler<MarkGroupPolicyTeamAsSyncedCommand> {
    constructor(private readonly groupPolicyTeamRepositoryService: GroupPolicyTeamRepositoryService) {}

    public async execute(command: MarkGroupPolicyTeamAsSyncedCommand): Promise<void> {
        const groupPolicyTeam = await this.groupPolicyTeamRepositoryService.findOneBy(command.tenantId, {
            groupPolicyId: command.groupPolicyId,
            teamId: command.teamId,
        });

        if (!groupPolicyTeam) {
            throw new NotFoundException(
                `Group policy team with group policy ID "${command.groupPolicyId}" and team ID "${command.teamId}" not found.`,
            );
        }

        groupPolicyTeam.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.groupPolicyTeamRepositoryService.createOrUpdateByGroupPolicyIdAndTeamId(command.tenantId, [
            groupPolicyTeam,
        ]);
    }
}
