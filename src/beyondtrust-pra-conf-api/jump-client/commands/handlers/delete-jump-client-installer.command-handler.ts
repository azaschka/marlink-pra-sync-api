import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { DeleteJumpClientInstallerCommand } from '../delete-jump-client-installer.command';

@CommandHandler(DeleteJumpClientInstallerCommand)
export class DeleteJumpClientInstallerCommandHandler implements ICommandHandler<DeleteJumpClientInstallerCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: DeleteJumpClientInstallerCommand): Promise<void> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpClient.path,
            this.appConfigService.beyondTrust.api.jumpClient.installer.path,
            command.id.toString(),
        );

        return await this.httpClientService.delete(url);
    }
}
