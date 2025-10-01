import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { CreateUserDtoInput } from '../../dtos/inputs';
import { UserCreatedDtoOutput } from '../../dtos/outputs';
import { CreateUserCommand } from '../create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: CreateUserCommand): Promise<UserCreatedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.user.path,
        );

        return await this.httpClientService.post<UserCreatedDtoOutput, UserCreatedDtoOutput>(
            UserCreatedDtoOutput,
            command.transactionId,
            command.beyondtrustInstanceId,
            urlPath,
            CreateUserDtoInput.create(
                command.publicDisplayName,
                command.username,
                command.password,
                command.passwordExpirationDate,
                command.email,
                command.preferredEmailLanguage,
                command.isTwoFactorAuthRequired,
                command.isLoginAllowed,
                command.failedLoginAttempts,
                command.mustResetPasswordOnNextLogin,
            ),
        );
    }
}
