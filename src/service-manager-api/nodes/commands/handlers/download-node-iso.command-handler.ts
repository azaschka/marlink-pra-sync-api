import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AxiosResponse } from 'axios';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { DownloadNodeIsoCommand } from '../download-node-iso.command';

@CommandHandler(DownloadNodeIsoCommand)
export class DownloadNodeIsoCommandHandler implements ICommandHandler<DownloadNodeIsoCommand> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(command: DownloadNodeIsoCommand): Promise<Buffer> {
        const url = UrlUtility.join(
            this.appConfigService.serviceManager.api.baseUrl,
            this.appConfigService.serviceManager.api.version.path,
            this.appConfigService.serviceManager.api.node.path,
            command.certname,
            this.appConfigService.serviceManager.api.node.iso,
        );

        const res = await this.httpClientService.stream(url);

        return this.streamToBuffer(res);
    }

    private async streamToBuffer(response: AxiosResponse<NodeJS.ReadableStream>): Promise<Buffer> {
        const chunks: Buffer[] = [];

        for await (const chunk of response.data) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }

        return Buffer.concat(chunks);
    }
}
