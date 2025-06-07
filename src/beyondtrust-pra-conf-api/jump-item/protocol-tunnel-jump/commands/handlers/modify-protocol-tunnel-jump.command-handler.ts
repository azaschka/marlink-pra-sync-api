import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { ModifyProtocolTunnelJumpDtoInput } from '../../dtos/inputs';
import { ProtocolTunnelJumpModifiedDtoOutput } from '../../dtos/outputs';
import { ModifyProtocolTunnelJumpCommand } from '../modify-protocol-tunnel-jump.command';

@CommandHandler(ModifyProtocolTunnelJumpCommand)
export class ModifyProtocolTunnelJumpCommandHandler implements ICommandHandler<ModifyProtocolTunnelJumpCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: ModifyProtocolTunnelJumpCommand): Promise<ProtocolTunnelJumpModifiedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.protocolTunnelJump.path,
            command.id.toString(),
        );

        return await this.httpClientService.patch<
            ProtocolTunnelJumpModifiedDtoOutput,
            ProtocolTunnelJumpModifiedDtoOutput
        >(
            ProtocolTunnelJumpModifiedDtoOutput,
            url,
            ModifyProtocolTunnelJumpDtoInput.create(
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
