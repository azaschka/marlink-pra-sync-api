import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { CreateRemoteRdpDtoInput } from '../../dtos/inputs';
import { RemoteRdpCreatedDtoOutput } from '../../dtos/outputs';
import { CreateRemoteRdpCommand } from '../create-remote-rdp.command';

@CommandHandler(CreateRemoteRdpCommand)
export class CreateRemoteRdpCommandHandler implements ICommandHandler<CreateRemoteRdpCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateRemoteRdpCommand): Promise<RemoteRdpCreatedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.remoteRdp.path,
        );

        return await this.httpClientService.post<RemoteRdpCreatedDtoOutput, RemoteRdpCreatedDtoOutput>(
            RemoteRdpCreatedDtoOutput,
            url,
            CreateRemoteRdpDtoInput.create(
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
