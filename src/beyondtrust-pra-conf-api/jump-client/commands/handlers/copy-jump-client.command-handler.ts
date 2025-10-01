import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { CopyJumpClientDtoInput } from '../../dtos/inputs';
import { JumpClientCopiedDtoOutput } from '../../dtos/outputs';
import { CopyJumpClientCommand } from '../copy-jump-client.command';

@CommandHandler(CopyJumpClientCommand)
export class CopyJumpClientCommandHandler implements ICommandHandler<CopyJumpClientCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CopyJumpClientCommand): Promise<JumpClientCopiedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpClient.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.config.jumpClient.copy,
        );

        return await this.httpClientService.post<JumpClientCopiedDtoOutput, JumpClientCopiedDtoOutput>(
            JumpClientCopiedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            CopyJumpClientDtoInput.create(command.jumpGroupId, command.jumpGroupType, command.name),
        );
    }
}
