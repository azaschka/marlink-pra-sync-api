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
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpClient.path,
            command.id.toString(),
        );

        return await this.httpClientService.patch<JumpClientModifiedDtoOutput, JumpClientModifiedDtoOutput>(
            JumpClientModifiedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
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
