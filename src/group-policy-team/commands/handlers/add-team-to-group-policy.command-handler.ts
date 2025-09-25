import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AddTeamToGroupPolicyCommand as BTAddTeamToGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { TeamAddedToGroupPolicyDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyTeamAddedEvent, GroupPolicyTeamAdditionFailedEvent } from '../../events';
import { GroupPolicyTeam } from '../../models';
import { GroupPolicyTeamEntity } from '../../repositories/entities';
import { GroupPolicyTeamRepositoryService } from '../../repositories/services/group-policy-team-repository.service';
import { AddTeamToGroupPolicyCommand } from '../add-team-to-group-policy.command';

@CommandHandler(AddTeamToGroupPolicyCommand)
export class AddTeamToGroupPolicyCommandHandler implements ICommandHandler<AddTeamToGroupPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyTeamRepositoryService: GroupPolicyTeamRepositoryService,
    ) {}

    public async execute(command: AddTeamToGroupPolicyCommand): Promise<GroupPolicyTeam> {
        const btGroupPolicyTeam = await this.addBTGroupPolicyTeam(command);
        const groupPolicyTeamEntity = this.createGroupPolicyTeamEntity(command.id, btGroupPolicyTeam);

        try {
            const groupPolicyTeam = await this.addGroupPolicyTeam(command.tenantId, groupPolicyTeamEntity);

            this.eventBus.publish(
                new GroupPolicyTeamAddedEvent(command.transactionId, {
                    groupPolicyTeam: groupPolicyTeam,
                    tenantId: command.tenantId,
                }),
            );

            return groupPolicyTeam;
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyTeamAdditionFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    groupPolicyTeam: groupPolicyTeamEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async addBTGroupPolicyTeam(command: AddTeamToGroupPolicyCommand) {
        return await this.commandBus.execute<BTAddTeamToGroupPolicyCommand, TeamAddedToGroupPolicyDtoOutput>(
            new BTAddTeamToGroupPolicyCommand(
                command.transactionId,
                command.tenantId,
                command.id,
                command.teamId,
                command.roleType,
            ),
        );
    }

    private createGroupPolicyTeamEntity(groupPolicyId: number, btGroupPolicyTeam: TeamAddedToGroupPolicyDtoOutput) {
        return GroupPolicyTeamEntity.create(groupPolicyId, btGroupPolicyTeam.teamId, btGroupPolicyTeam.role);
    }

    private async addGroupPolicyTeam(
        tenantId: number,
        groupPolicyTeamEntity: GroupPolicyTeamEntity,
    ): Promise<GroupPolicyTeam> {
        await this.groupPolicyTeamRepositoryService.create(tenantId, groupPolicyTeamEntity);

        return {
            groupPolicyId: groupPolicyTeamEntity.groupPolicyId,
            teamId: groupPolicyTeamEntity.teamId,
            roleType: groupPolicyTeamEntity.roleType,
            lastSyncDate: groupPolicyTeamEntity.lastSyncDate,
        };
    }
}
