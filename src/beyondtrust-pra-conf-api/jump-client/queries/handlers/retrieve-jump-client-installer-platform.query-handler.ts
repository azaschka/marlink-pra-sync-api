import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AxiosResponse } from 'axios';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveJumpClientInstallerPlatformQuery } from '../retrieve-jump-client-installer-platform.query';

@QueryHandler(RetrieveJumpClientInstallerPlatformQuery)
export class RetrieveJumpClientInstallerPlatformQueryHandler
    implements IQueryHandler<RetrieveJumpClientInstallerPlatformQuery>
{
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(
        query: RetrieveJumpClientInstallerPlatformQuery,
    ): Promise<AxiosResponse<NodeJS.ReadableStream>> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpClient.path,
            this.appConfigService.beyondTrust.api.config.jumpClient.installer.path,
            query.installerId,
            query.platform,
        );

        return this.httpClientService.stream(query.transactionId, query.beyondtrustInstanceId, urlPath);
    }
}
