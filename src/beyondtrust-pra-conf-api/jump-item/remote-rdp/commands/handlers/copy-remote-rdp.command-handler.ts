import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { CopyRemoteRdpDtoInput } from '../../dtos/inputs';
import { RemoteRdpCopiedDtoOutput } from '../../dtos/outputs';
import { CopyRemoteRdpCommand } from '../copy-remote-rdp.command';

@CommandHandler(CopyRemoteRdpCommand)
export class CopyRemoteRdpCommandHandler implements ICommandHandler<CopyRemoteRdpCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CopyRemoteRdpCommand): Promise<RemoteRdpCopiedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpItem.remoteRdp.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.config.jumpItem.remoteRdp.copy,
        );

        return await this.httpClientService.post<RemoteRdpCopiedDtoOutput, RemoteRdpCopiedDtoOutput>(
            RemoteRdpCopiedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            CopyRemoteRdpDtoInput.create(command.name, command.jumpGroupId, command.jumpGroupType),
        );
    }
}
