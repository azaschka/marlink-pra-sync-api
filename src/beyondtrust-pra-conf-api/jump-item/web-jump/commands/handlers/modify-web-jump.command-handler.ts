import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { ModifyWebJumpDtoInput } from '../../dtos/inputs';
import { WebJumpModifiedDtoOutput } from '../../dtos/outputs';
import { ModifyWebJumpCommand } from '../modify-web-jump.command';

@CommandHandler(ModifyWebJumpCommand)
export class ModifyWebJumpCommandHandler implements ICommandHandler<ModifyWebJumpCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: ModifyWebJumpCommand): Promise<WebJumpModifiedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpItem.webJump.path,
            command.id.toString(),
        );

        return await this.httpClientService.patch<WebJumpModifiedDtoOutput, WebJumpModifiedDtoOutput>(
            WebJumpModifiedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            ModifyWebJumpDtoInput.create(
                command.name,
                command.jumpointId,
                command.url,
                command.jumpGroupId,
                command.jumpGroupType,
                command.usernameFormat,
                command.verifyCertificate,
                command.authenticationTimeout,
                command.tag,
                command.comments,
                command.jumpPolicyId,
                command.usernameField,
                command.passwordField,
                command.submitField,
                command.sessionPolicyId,
            ),
        );
    }
}
