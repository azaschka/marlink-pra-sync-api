import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { DeleteJumpPolicyCommand } from '../delete-jump-policy.command';

@CommandHandler(DeleteJumpPolicyCommand)
export class DeleteJumpPolicyCommandHandler implements ICommandHandler<DeleteJumpPolicyCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: DeleteJumpPolicyCommand): Promise<void> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.path.jumpPolicy,
            command.id.toString(),
        );

        return await this.httpClientService.delete(url);
    }
}
