import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { CopyRemoteVncDtoInput } from '../../dtos/inputs';
import { RemoteVncCopiedDtoOutput } from '../../dtos/outputs';
import { CopyRemoteVncCommand } from '../copy-remote-vnc.command';

@CommandHandler(CopyRemoteVncCommand)
export class CopyRemoteVncCommandHandler implements ICommandHandler<CopyRemoteVncCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CopyRemoteVncCommand): Promise<RemoteVncCopiedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpItem.remoteVnc.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.config.jumpItem.remoteVnc.copy,
        );

        return await this.httpClientService.post<RemoteVncCopiedDtoOutput, RemoteVncCopiedDtoOutput>(
            RemoteVncCopiedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            CopyRemoteVncDtoInput.create(command.name, command.jumpGroupId, command.jumpGroupType),
        );
    }
}
