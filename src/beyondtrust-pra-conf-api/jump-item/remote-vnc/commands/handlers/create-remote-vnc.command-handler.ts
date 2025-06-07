import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { CreateRemoteVncDtoInput } from '../../dtos/inputs';
import { RemoteVncCreatedDtoOutput } from '../../dtos/outputs';
import { CreateRemoteVncCommand } from '../create-remote-vnc.command';

@CommandHandler(CreateRemoteVncCommand)
export class CreateRemoteVncCommandHandler implements ICommandHandler<CreateRemoteVncCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateRemoteVncCommand): Promise<RemoteVncCreatedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.remoteVnc.path,
        );

        return await this.httpClientService.post<RemoteVncCreatedDtoOutput, RemoteVncCreatedDtoOutput>(
            RemoteVncCreatedDtoOutput,
            url,
            CreateRemoteVncDtoInput.create(
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
