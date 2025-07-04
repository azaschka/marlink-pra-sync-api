import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RemoveTeamFromGroupPolicyCommand } from '../remove-team-from-group-policy.command';

@CommandHandler(RemoveTeamFromGroupPolicyCommand)
export class RemoveTeamFromGroupPolicyCommandHandler implements ICommandHandler<RemoveTeamFromGroupPolicyCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: RemoveTeamFromGroupPolicyCommand): Promise<void> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.groupPolicy.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.groupPolicy.team.path,
            command.teamId.toString(),
        );

        return await this.httpClientService.delete(url);
    }
}
