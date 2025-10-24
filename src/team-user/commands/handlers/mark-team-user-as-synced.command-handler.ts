import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtility } from '../../../shared/utilities';
import { TeamUserRepositoryService } from '../../repositories/services/team-user-repository.service';
import { MarkTeamUserAsSyncedCommand } from '../mark-team-user-as-synced.command';

@CommandHandler(MarkTeamUserAsSyncedCommand)
export class MarkTeamUserAsSyncedCommandHandler implements ICommandHandler<MarkTeamUserAsSyncedCommand> {
    constructor(private readonly teamUserRepositoryService: TeamUserRepositoryService) {}

    public async execute(command: MarkTeamUserAsSyncedCommand): Promise<void> {
        const teamUser = await this.teamUserRepositoryService.findOneBy(command.tenantId, {
            teamId: command.teamId,
            userId: command.userId,
        });

        if (!teamUser) {
            throw new NotFoundException(
                `Team user with team ID "${command.teamId}" and user ID "${command.userId}" not found.`,
            );
        }

        teamUser.lastSyncDate = DateUtility.getCurrentUtcDate();

        await this.teamUserRepositoryService.createOrUpdateByTeamIdAndUserId(command.tenantId, [teamUser]);
    }
}
