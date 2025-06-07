import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RetrieveRemoteVncsDtoInput } from '../../dtos/inputs';
import { RemoteVncRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveRemoteVncsQuery } from '../retrieve-remote-vncs.query';

@QueryHandler(RetrieveRemoteVncsQuery)
export class RetrieveRemoteVncsQueryHandler implements IQueryHandler<RetrieveRemoteVncsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveRemoteVncsQuery): Promise<RemoteVncRetrievedDtoOutput[]> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpItem.remoteVnc.path,
        );

        return await this.httpClientService.get<RemoteVncRetrievedDtoOutput, RemoteVncRetrievedDtoOutput[]>(
            RemoteVncRetrievedDtoOutput,
            url,
            RetrieveRemoteVncsDtoInput.create(
                query.pageSize,
                query.pageNumber,
                query.name,
                query.hostname,
                query.jumpGroupId,
                query.jumpGroupType,
                query.jumpointId,
                query.tag,
            ),
        );
    }
}
