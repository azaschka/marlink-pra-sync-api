import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { DeleteJumpGroupCommand } from '../delete-jump-group.command';

@CommandHandler(DeleteJumpGroupCommand)
export class DeleteJumpGroupCommandHandler implements ICommandHandler<DeleteJumpGroupCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: DeleteJumpGroupCommand): Promise<void> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.path.jumpGroup,
            command.id.toString(),
        );

        return await this.httpClientService.delete(url);
    }
}
