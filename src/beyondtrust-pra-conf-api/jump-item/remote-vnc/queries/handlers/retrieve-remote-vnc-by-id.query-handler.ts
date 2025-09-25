import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RemoteVncRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveRemoteVncByIdQuery } from '../retrieve-remote-vnc-by-id.query';

@QueryHandler(RetrieveRemoteVncByIdQuery)
export class RetrieveRemoteVncByIdQueryHandler implements IQueryHandler<RetrieveRemoteVncByIdQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveRemoteVncByIdQuery): Promise<RemoteVncRetrievedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpItem.remoteVnc.path,
            query.id.toString(),
        );

        return await this.httpClientService.get<RemoteVncRetrievedDtoOutput, RemoteVncRetrievedDtoOutput>(
            RemoteVncRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
        );
    }
}
