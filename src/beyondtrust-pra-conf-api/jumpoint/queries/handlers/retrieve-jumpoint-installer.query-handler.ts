import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AxiosResponse } from 'axios';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveJumpointInstallerQuery } from '../retrieve-jumpoint-installer.query';

@QueryHandler(RetrieveJumpointInstallerQuery)
export class RetrieveJumpointInstallerQueryHandler implements IQueryHandler<RetrieveJumpointInstallerQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveJumpointInstallerQuery): Promise<AxiosResponse<NodeJS.ReadableStream>> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpoint.path,
            query.jumpointId.toString(),
            this.appConfigService.beyondTrust.api.jumpoint.installer.path,
        );

        return this.httpClientService.stream(url);
    }
}
