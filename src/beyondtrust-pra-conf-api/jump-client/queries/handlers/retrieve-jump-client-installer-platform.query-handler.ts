import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
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

    public async execute(query: RetrieveJumpClientInstallerPlatformQuery): Promise<Buffer> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpClient.path,
            this.appConfigService.beyondTrust.api.jumpClient.installer.path,
            query.installerId.toString(),
            query.platform.toString(),
        );

        return await this.httpClientService.get<Buffer, Buffer>(Buffer, url);
    }
}
