import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { CreateWebJumpDtoInput } from '../../dtos/inputs';
import { WebJumpCreatedDtoOutput } from '../../dtos/outputs';
import { CreateWebJumpCommand } from '../create-web-jump.command';

@CommandHandler(CreateWebJumpCommand)
export class CreateWebJumpCommandHandler implements ICommandHandler<CreateWebJumpCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateWebJumpCommand): Promise<WebJumpCreatedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpItem.webJump.path,
        );

        return await this.httpClientService.post<WebJumpCreatedDtoOutput, WebJumpCreatedDtoOutput>(
            WebJumpCreatedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            CreateWebJumpDtoInput.create(
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
