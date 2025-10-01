import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { DeleteJumpointCommand } from '../delete-jumpoint.command';

@CommandHandler(DeleteJumpointCommand)
export class DeleteJumpointCommandHandler implements ICommandHandler<DeleteJumpointCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: DeleteJumpointCommand): Promise<void> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpoint.path,
            command.id.toString(),
        );

        return await this.httpClientService.delete(command.transactionId, command.beyondtrustInstanceId, urlPath);
    }
}
