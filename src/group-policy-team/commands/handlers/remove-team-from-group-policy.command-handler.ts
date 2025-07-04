import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RemoveTeamFromGroupPolicyCommand as BTRemoveTeamFromGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyTeamRemovalFailedEvent, GroupPolicyTeamRemovedEvent } from '../../events';
import { GroupPolicyTeamRepositoryService } from '../../repositories/services/group-policy-team-repository.service';
import { RemoveTeamFromGroupPolicyCommand } from '../remove-team-from-group-policy.command';

@CommandHandler(RemoveTeamFromGroupPolicyCommand)
export class RemoveTeamFromGroupPolicyCommandHandler implements ICommandHandler<RemoveTeamFromGroupPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyTeamRepositoryService: GroupPolicyTeamRepositoryService,
    ) {}

    public async execute(command: RemoveTeamFromGroupPolicyCommand): Promise<void> {
        await this.removeBTGroupPolicyTeam(command);

        try {
            await this.removeGroupPolicyTeam(command.id, command.teamId);

            this.eventBus.publish(
                new GroupPolicyTeamRemovedEvent(command.transactionId, {
                    groupPolicyId: command.id,
                    teamId: command.teamId,
                }),
            );
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyTeamRemovalFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    groupPolicyId: command.id,
                    teamId: command.teamId,
                }),
            );

            throw error;
        }
    }

    private async removeBTGroupPolicyTeam(command: RemoveTeamFromGroupPolicyCommand) {
        await this.commandBus.execute<BTRemoveTeamFromGroupPolicyCommand, void>(
            new BTRemoveTeamFromGroupPolicyCommand(command.transactionId, command.id, command.teamId),
        );
    }

    private async removeGroupPolicyTeam(groupPolicyId: number, teamId: number): Promise<void> {
        await this.groupPolicyTeamRepositoryService.deleteByGroupPolicyIdAndTeamId(groupPolicyId, teamId);
    }
}
