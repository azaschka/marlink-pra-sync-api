import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AddUserToTeamCommand as BTAddUserToTeamCommand } from '../../../beyondtrust-pra-conf-api/team/commands';
import { UserAddedToTeamDtoOutput } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { TeamUserAddedEvent, TeamUserAdditionFailedEvent } from '../../events';
import { mapFromBTUserTeamRoleType } from '../../mappers';
import { TeamUser } from '../../models';
import { TeamUserEntity } from '../../repositories/entities';
import { TeamUserRepositoryService } from '../../repositories/services/team-user-repository.service';
import { AddUserToTeamCommand } from '../add-user-to-team.command';

@CommandHandler(AddUserToTeamCommand)
export class AddUserToTeamCommandHandler implements ICommandHandler<AddUserToTeamCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly teamUserRepositoryService: TeamUserRepositoryService,
    ) {}

    public async execute(command: AddUserToTeamCommand): Promise<TeamUser> {
        const btTeamUser = await this.addBTTeamUser(command);
        const teamUserEntity = this.createTeamUserEntity(command.id, btTeamUser);

        try {
            const teamUser = await this.addTeamUser(command.tenantId, teamUserEntity);

            this.eventBus.publish(
                new TeamUserAddedEvent(command.transactionId, {
                    teamUser: teamUser,
                    tenantId: command.tenantId,
                }),
            );

            return teamUser;
        } catch (error) {
            this.eventBus.publish(
                new TeamUserAdditionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    teamUser: teamUserEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async addBTTeamUser(command: AddUserToTeamCommand) {
        return await this.commandBus.execute<BTAddUserToTeamCommand, UserAddedToTeamDtoOutput>(
            new BTAddUserToTeamCommand(
                command.transactionId,
                command.tenantId,
                command.id,
                command.userId,
                command.roleType,
            ),
        );
    }

    private createTeamUserEntity(teamId: number, btTeamUser: UserAddedToTeamDtoOutput) {
        return TeamUserEntity.create(teamId, btTeamUser.userId, mapFromBTUserTeamRoleType(btTeamUser.role));
    }

    private async addTeamUser(tenantId: number, teamUserEntity: TeamUserEntity): Promise<TeamUser> {
        await this.teamUserRepositoryService.create(tenantId, teamUserEntity);

        return {
            teamId: teamUserEntity.teamId,
            userId: teamUserEntity.userId,
            roleType: teamUserEntity.roleType,
            lastSyncDate: teamUserEntity.lastSyncDate,
        };
    }
}
