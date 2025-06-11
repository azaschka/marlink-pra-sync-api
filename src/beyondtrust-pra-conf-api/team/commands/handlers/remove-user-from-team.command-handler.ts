import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RemoveUserFromTeamCommand } from '../remove-user-from-team.command';

@CommandHandler(RemoveUserFromTeamCommand)
export class RemoveUserFromTeamCommandHandler implements ICommandHandler<RemoveUserFromTeamCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: RemoveUserFromTeamCommand): Promise<void> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.team.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.team.user.path,
            command.userId.toString(),
        );

        return await this.httpClientService.delete(url);
    }
}
