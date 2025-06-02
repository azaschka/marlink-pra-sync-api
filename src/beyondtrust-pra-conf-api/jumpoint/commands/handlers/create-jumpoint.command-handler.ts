import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { ModifyJumpointDtoInput } from '../../dtos/inputs';
import { JumpointCreatedDtoOutput } from '../../dtos/outputs';
import { CreateJumpointCommand } from '../create-jumpoint.command';

@CommandHandler(CreateJumpointCommand)
export class CreateJumpointCommandHandler implements ICommandHandler<CreateJumpointCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateJumpointCommand): Promise<JumpointCreatedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpoint.path,
        );

        return await this.httpClientService.post<JumpointCreatedDtoOutput, JumpointCreatedDtoOutput>(
            JumpointCreatedDtoOutput,
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
