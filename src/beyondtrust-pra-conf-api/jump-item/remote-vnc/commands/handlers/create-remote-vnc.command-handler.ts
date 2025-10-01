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
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpItem.remoteVnc.path,
        );

        return await this.httpClientService.post<RemoteVncCreatedDtoOutput, RemoteVncCreatedDtoOutput>(
            RemoteVncCreatedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
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
