import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { ProtocolTunnelJumpRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveProtocolTunnelJumpByIdQuery } from '../retrieve-protocol-tunnel-jump-by-id.query';

@QueryHandler(RetrieveProtocolTunnelJumpByIdQuery)
export class RetrieveProtocolTunnelJumpByIdQueryHandler implements IQueryHandler<RetrieveProtocolTunnelJumpByIdQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveProtocolTunnelJumpByIdQuery): Promise<ProtocolTunnelJumpRetrievedDtoOutput> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpItem.protocolTunnelJump.path,
            query.id.toString(),
        );

        return await this.httpClientService.get<
            ProtocolTunnelJumpRetrievedDtoOutput,
            ProtocolTunnelJumpRetrievedDtoOutput
        >(ProtocolTunnelJumpRetrievedDtoOutput, query.transactionId, query.beyondtrustInstanceId, urlPath);
    }
}
