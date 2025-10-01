import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { CopyWebJumpDtoInput } from '../../dtos/inputs';
import { WebJumpCopiedDtoOutput } from '../../dtos/outputs';
import { CopyWebJumpCommand } from '../copy-web-jump.command';

@CommandHandler(CopyWebJumpCommand)
export class CopyWebJumpCommandHandler implements ICommandHandler<CopyWebJumpCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CopyWebJumpCommand): Promise<WebJumpCopiedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpItem.webJump.path,
            command.id.toString(),
            this.appConfigService.beyondTrust.api.config.jumpItem.webJump.copy,
        );

        return await this.httpClientService.post<WebJumpCopiedDtoOutput, WebJumpCopiedDtoOutput>(
            WebJumpCopiedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            CopyWebJumpDtoInput.create(command.name, command.jumpGroupId, command.jumpGroupType),
        );
    }
}
