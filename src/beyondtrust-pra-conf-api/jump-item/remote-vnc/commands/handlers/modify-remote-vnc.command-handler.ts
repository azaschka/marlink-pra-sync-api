import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { ModifyRemoteVncDtoInput } from '../../dtos/inputs';
import { RemoteVncModifiedDtoOutput } from '../../dtos/outputs';
import { ModifyRemoteVncCommand } from '../modify-remote-vnc.command';

@CommandHandler(ModifyRemoteVncCommand)
export class ModifyRemoteVncCommandHandler implements ICommandHandler<ModifyRemoteVncCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: ModifyRemoteVncCommand): Promise<RemoteVncModifiedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.remoteVnc.path,
            command.id.toString(),
        );

        return await this.httpClientService.patch<RemoteVncModifiedDtoOutput, RemoteVncModifiedDtoOutput>(
            RemoteVncModifiedDtoOutput,
            url,
            ModifyRemoteVncDtoInput.create(
                command.name,
                command.jumpointId,
                command.hostname,
                command.port,
                command.jumpGroupId,
                command.jumpGroupType,
                command.tag,
                command.comments,
                command.jumpPolicyId,
                command.sessionPolicyId,
            ),
        );
    }
}
