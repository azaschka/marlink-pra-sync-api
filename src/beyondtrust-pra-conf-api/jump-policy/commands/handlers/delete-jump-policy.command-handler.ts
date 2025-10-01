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
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpPolicy.path,
            command.id.toString(),
        );

        return await this.httpClientService.delete(command.transactionId, command.beyondtrustInstanceId, urlPath);
    }
}
