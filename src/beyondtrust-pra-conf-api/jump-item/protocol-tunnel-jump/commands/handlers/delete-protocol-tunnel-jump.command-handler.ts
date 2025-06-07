import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { DeleteProtocolTunnelJumpCommand } from '../delete-protocol-tunnel-jump.command';

@CommandHandler(DeleteProtocolTunnelJumpCommand)
export class DeleteProtocolTunnelJumpCommandHandler implements ICommandHandler<DeleteProtocolTunnelJumpCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: DeleteProtocolTunnelJumpCommand): Promise<void> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.protocolTunnelJump.path,
            command.id.toString(),
        );

        return await this.httpClientService.delete(url);
    }
}
