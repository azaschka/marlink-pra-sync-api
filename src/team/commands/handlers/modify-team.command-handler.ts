import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ModifyTeamCommand as BTModifyTeamCommand } from '../../../beyondtrust-pra-conf-api/team/commands';
import { TeamModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { TeamModificationFailedEvent, TeamModifiedEvent } from '../../events';
import { Team } from '../../models';
import { TeamEntity } from '../../repositories/entities';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { ModifyTeamCommand } from '../modify-team.command';

@CommandHandler(ModifyTeamCommand)
export class ModifyTeamCommandHandler implements ICommandHandler<ModifyTeamCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly teamRepositoryService: TeamRepositoryService,
    ) {}

    public async execute(command: ModifyTeamCommand): Promise<Team> {
        const btTeam = await this.modifyBTTeam(command);
        const teamEntity = this.createTeamEntity(btTeam);

        try {
            const updatedTeam = await this.updateTeam(command.tenantId, teamEntity);

            this.eventBus.publish(
                new TeamModifiedEvent(command.transactionId, {
                    team: updatedTeam,
                    tenantId: command.tenantId,
                }),
            );

            return updatedTeam;
        } catch (error) {
            this.eventBus.publish(
                new TeamModificationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    team: teamEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async modifyBTTeam(command: ModifyTeamCommand) {
        return await this.commandBus.execute<BTModifyTeamCommand, TeamModifiedDtoOutput>(
            new BTModifyTeamCommand(
                command.transactionId,
                command.tenantId,
                command.id,
                command.name,
                command.codeName,
                command.comments,
            ),
        );
    }

    private createTeamEntity(btTeam: TeamModifiedDtoOutput) {
        return TeamEntity.create(btTeam.id, btTeam.name, btTeam.codeName, btTeam.comments);
    }

    private async updateTeam(tenantId: number, teamEntity: TeamEntity) {
        await this.teamRepositoryService.createOrUpdateById(tenantId, teamEntity);

        const createdOrUpdatedTeam = await this.teamRepositoryService.findOneById(tenantId, teamEntity.id);

        if (!createdOrUpdatedTeam) {
            throw new Error('Team has been created or updated but could not be retrieved.');
        }

        return createdOrUpdatedTeam;
    }
}
