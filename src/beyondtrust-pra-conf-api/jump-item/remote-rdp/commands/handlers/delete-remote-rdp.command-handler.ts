import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { DeleteRemoteRdpCommand } from '../delete-remote-rdp.command';

@CommandHandler(DeleteRemoteRdpCommand)
export class DeleteRemoteRdpCommandHandler implements ICommandHandler<DeleteRemoteRdpCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: DeleteRemoteRdpCommand): Promise<void> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.remoteRdp.path,
            command.id.toString(),
        );

        return await this.httpClientService.delete(url);
    }
}
