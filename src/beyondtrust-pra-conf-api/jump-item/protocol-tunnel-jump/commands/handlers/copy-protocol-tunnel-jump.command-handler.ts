import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { CopyProtocolTunnelJumpDtoInput } from '../../dtos/inputs';
import { ProtocolTunnelJumpCopiedDtoOutput } from '../../dtos/outputs';
import { CopyProtocolTunnelJumpCommand } from '../copy-protocol-tunnel-jump.command';

@CommandHandler(CopyProtocolTunnelJumpCommand)
export class CopyProtocolTunnelJumpCommandHandler implements ICommandHandler<CopyProtocolTunnelJumpCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CopyProtocolTunnelJumpCommand): Promise<ProtocolTunnelJumpCopiedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.protocolTunnelJump.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.jumpItem.protocolTunnelJump.copy,
        );

        return await this.httpClientService.post<ProtocolTunnelJumpCopiedDtoOutput, ProtocolTunnelJumpCopiedDtoOutput>(
            ProtocolTunnelJumpCopiedDtoOutput,
            url,
            CopyProtocolTunnelJumpDtoInput.create(command.name, command.jumpGroupId, command.jumpGroupType),
        );
    }
}
