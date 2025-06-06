import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RetrieveRemoteRdpsDtoInput } from '../../dtos/inputs';
import { RemoteRdpRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveRemoteRdpsQuery } from '../retrieve-remote-rdps.query';

@QueryHandler(RetrieveRemoteRdpsQuery)
export class RetrieveRemoteRdpsQueryHandler implements IQueryHandler<RetrieveRemoteRdpsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveRemoteRdpsQuery): Promise<RemoteRdpRetrievedDtoOutput[]> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.remoteRdp.path,
        );

        return await this.httpClientService.get<RemoteRdpRetrievedDtoOutput, RemoteRdpRetrievedDtoOutput[]>(
            RemoteRdpRetrievedDtoOutput,
            url,
            RetrieveRemoteRdpsDtoInput.create(
                query.pageSize,
                query.pageNumber,
                query.name,
                query.hostname,
                query.jumpGroupId,
                query.jumpGroupType,
                query.jumpointId,
                query.endpointId,
                query.tag,
            ),
        );
    }
}
