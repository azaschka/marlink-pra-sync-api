import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { ModifyJumpClientDtoInput } from '../../dtos/inputs';
import { JumpClientModifiedDtoOutput } from '../../dtos/outputs';
import { ModifyJumpClientCommand } from '../modify-jump-client.command';

@CommandHandler(ModifyJumpClientCommand)
export class ModifyJumpClientCommandHandler implements ICommandHandler<ModifyJumpClientCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: ModifyJumpClientCommand): Promise<JumpClientModifiedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpClient.path,
            command.id.toString(),
        );

        return await this.httpClientService.patch<JumpClientModifiedDtoOutput, JumpClientModifiedDtoOutput>(
            JumpClientModifiedDtoOutput,
            url,
            ModifyJumpClientDtoInput.create(
                command.jumpGroupId,
                command.jumpGroupType,
                command.name,
                command.tag,
                command.comments,
                command.jumpPolicyId,
                command.sessionPolicyId,
                command.maxOfflineMinutes,
                command.endpointAgreementPolicy,
            ),
        );
    }
}
