import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { DeleteRemoteVncCommand } from '../delete-remote-vnc.command';

@CommandHandler(DeleteRemoteVncCommand)
export class DeleteRemoteVncCommandHandler implements ICommandHandler<DeleteRemoteVncCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: DeleteRemoteVncCommand): Promise<void> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.remoteVnc.path,
            command.id.toString(),
        );

        return await this.httpClientService.delete(url);
    }
}
