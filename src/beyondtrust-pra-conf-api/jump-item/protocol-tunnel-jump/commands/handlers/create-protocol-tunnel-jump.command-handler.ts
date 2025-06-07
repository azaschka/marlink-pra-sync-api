import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { CreateProtocolTunnelJumpDtoInput } from '../../dtos/inputs';
import { ProtocolTunnelJumpCreatedDtoOutput } from '../../dtos/outputs';
import { CreateProtocolTunnelJumpCommand } from '../create-protocol-tunnel-jump.command';

@CommandHandler(CreateProtocolTunnelJumpCommand)
export class CreateProtocolTunnelJumpCommandHandler implements ICommandHandler<CreateProtocolTunnelJumpCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateProtocolTunnelJumpCommand): Promise<ProtocolTunnelJumpCreatedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.protocolTunnelJump.path,
        );

        return await this.httpClientService.post<
            ProtocolTunnelJumpCreatedDtoOutput,
            ProtocolTunnelJumpCreatedDtoOutput
        >(
            ProtocolTunnelJumpCreatedDtoOutput,
            url,
            CreateProtocolTunnelJumpDtoInput.create(
                command.name,
                command.jumpointId,
                command.hostname,
                command.jumpGroupId,
                command.jumpGroupType,
                command.tag,
                command.comments,
                command.jumpPolicyId,
                command.sessionPolicyId,
                command.tunnelListenAddress,
                command.tunnelDefinitions,
                command.tunnelType,
                command.username,
                command.database,
                command.url,
                command.caCertificates,
            ),
        );
    }
}
