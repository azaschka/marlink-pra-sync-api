import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RemoteRdpRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveRemoteRdpByIdQuery } from '../retrieve-remote-rdp-by-id.query';

@QueryHandler(RetrieveRemoteRdpByIdQuery)
export class RetrieveRemoteRdpByIdQueryHandler implements IQueryHandler<RetrieveRemoteRdpByIdQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveRemoteRdpByIdQuery): Promise<RemoteRdpRetrievedDtoOutput> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.remoteRdp.path,
            query.id.toString(),
        );

        return await this.httpClientService.get<RemoteRdpRetrievedDtoOutput, RemoteRdpRetrievedDtoOutput>(
            RemoteRdpRetrievedDtoOutput,
            url,
        );
    }
}
