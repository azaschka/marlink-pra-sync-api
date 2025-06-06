import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { ModifyRemoteRdpDtoInput } from '../../dtos/inputs';
import { RemoteRdpModifiedDtoOutput } from '../../dtos/outputs';
import { ModifyRemoteRdpCommand } from '../modify-remote-rdp.command';

@CommandHandler(ModifyRemoteRdpCommand)
export class ModifyRemoteRdpCommandHandler implements ICommandHandler<ModifyRemoteRdpCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: ModifyRemoteRdpCommand): Promise<RemoteRdpModifiedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.remoteRdp.path,
            command.id.toString(),
        );

        return await this.httpClientService.patch<RemoteRdpModifiedDtoOutput, RemoteRdpModifiedDtoOutput>(
            RemoteRdpModifiedDtoOutput,
            url,
            ModifyRemoteRdpDtoInput.create(
                command.name,
                command.jumpointId,
                command.hostname,
                command.jumpGroupId,
                command.jumpGroupType,
                command.quality,
                command.console,
                command.ignoreUntrusted,
                command.tag,
                command.comments,
                command.rdpUsername,
                command.domain,
                command.jumpPolicyId,
                command.sessionForensics,
                command.sessionPolicyId,
                command.secureAppType,
                command.remoteAppName,
                command.remoteAppParams,
                command.remoteExePath,
                command.remoteExeParams,
                command.targetSystem,
                command.credentialType,
            ),
        );
    }
}
