import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { MarkTeamAsSyncedCommand } from '../mark-team-as-synced.command';

@CommandHandler(MarkTeamAsSyncedCommand)
export class MarkTeamAsSyncedCommandHandler implements ICommandHandler<MarkTeamAsSyncedCommand> {
    constructor(private readonly teamRepositoryService: TeamRepositoryService) {}

    public async execute(command: MarkTeamAsSyncedCommand): Promise<void> {
        const team = await this.teamRepositoryService.findOneById(command.tenantId, command.id);

        if (!team) {
            throw new NotFoundException(`Team with ID "${command.id}" not found.`);
        }

        team.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.teamRepositoryService.createOrUpdateById(command.tenantId, team);
    }
}
