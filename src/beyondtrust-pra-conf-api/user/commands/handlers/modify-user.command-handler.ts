import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { ModifyUserDtoInput } from '../../dtos/inputs';
import { UserModifiedDtoOutput } from '../../dtos/outputs';
import { ModifyUserCommand } from '../modify-user.command';

@CommandHandler(ModifyUserCommand)
export class ModifyUserCommandHandler implements ICommandHandler<ModifyUserCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: ModifyUserCommand): Promise<UserModifiedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.user.path,
            command.id.toString(),
        );

        return await this.httpClientService.patch<UserModifiedDtoOutput, UserModifiedDtoOutput>(
            UserModifiedDtoOutput,
            url,
            ModifyUserDtoInput.create(
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
