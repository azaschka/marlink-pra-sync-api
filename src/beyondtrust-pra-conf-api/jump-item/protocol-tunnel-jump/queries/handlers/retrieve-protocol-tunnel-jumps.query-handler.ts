import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RetrieveProtocolTunnelJumpsDtoInput } from '../../dtos/inputs';
import { ProtocolTunnelJumpRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveProtocolTunnelJumpsQuery } from '../retrieve-protocol-tunnel-jumps.query';

@QueryHandler(RetrieveProtocolTunnelJumpsQuery)
export class RetrieveProtocolTunnelJumpsQueryHandler implements IQueryHandler<RetrieveProtocolTunnelJumpsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveProtocolTunnelJumpsQuery): Promise<ProtocolTunnelJumpRetrievedDtoOutput[]> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.jumpItem.protocolTunnelJump.path,
        );

        return await this.httpClientService.get<
            ProtocolTunnelJumpRetrievedDtoOutput,
            ProtocolTunnelJumpRetrievedDtoOutput[]
        >(
            ProtocolTunnelJumpRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
            RetrieveProtocolTunnelJumpsDtoInput.create(
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
