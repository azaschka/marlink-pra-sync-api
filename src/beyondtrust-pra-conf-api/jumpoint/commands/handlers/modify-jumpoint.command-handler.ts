import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { ModifyJumpointDtoInput } from '../../dtos/inputs';
import { JumpointModifiedDtoOutput } from '../../dtos/outputs';
import { ModifyJumpointCommand } from '../modify-jumpoint.command';

@CommandHandler(ModifyJumpointCommand)
export class ModifyJumpointCommandHandler implements ICommandHandler<ModifyJumpointCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: ModifyJumpointCommand): Promise<JumpointModifiedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpoint.path,
            command.id.toString(),
        );

        return await this.httpClientService.patch<JumpointModifiedDtoOutput, JumpointModifiedDtoOutput>(
            JumpointModifiedDtoOutput,
            url,
            ModifyJumpointDtoInput.create(
                command.name,
                command.platform,
                command.codeName,
                command.comments,
                command.enabled,
                command.clustered,
                command.shellJumpEnabled,
                command.externalJumpItemNetworkId,
                command.protocolTunnelEnabled,
                command.rdpServiceAccountId,
                command.managedIpRanges,
                command.jzpEnabled,
                command.jzpProxyHostname,
                command.jzpProxyPort,
                command.jzpAllowHttpGet,
                command.jzpClientAddressRestrictionsType,
                command.jzpRestrictedIps,
            ),
        );
    }
}
