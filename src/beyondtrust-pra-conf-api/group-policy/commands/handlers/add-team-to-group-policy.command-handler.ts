import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { AddTeamToGroupPolicyDtoInput } from '../../dtos/inputs';
import { TeamAddedToGroupPolicyDtoOutput } from '../../dtos/outputs';
import { AddTeamToGroupPolicyCommand } from '../add-team-to-group-policy.command';

@CommandHandler(AddTeamToGroupPolicyCommand)
export class AddTeamToGroupPolicyCommandHandler implements ICommandHandler<AddTeamToGroupPolicyCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: AddTeamToGroupPolicyCommand): Promise<TeamAddedToGroupPolicyDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.groupPolicy.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.config.groupPolicy.team.path,
        );

        return await this.httpClientService.post<TeamAddedToGroupPolicyDtoOutput, TeamAddedToGroupPolicyDtoOutput>(
            TeamAddedToGroupPolicyDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            AddTeamToGroupPolicyDtoInput.create(command.teamId, command.role),
        );
    }
}
