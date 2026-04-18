import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { ApproveNodeCommand } from '../approve-node.command';

@CommandHandler(ApproveNodeCommand)
export class ApproveNodeCommandHandler implements ICommandHandler<ApproveNodeCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: ApproveNodeCommand): Promise<void> {
        const url = UrlUtility.join(
            this.appConfigService.serviceManager.api.baseUrl,
            this.appConfigService.serviceManager.api.version.path,
            this.appConfigService.serviceManager.api.node.path,
            command.certname,
            this.appConfigService.serviceManager.api.node.approve,
        );

        await this.httpClientService.post<void, void>(undefined, url);
    }
}
