import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpointNodeRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveJumpointNodesQuery } from '../retrieve-jumpoint-nodes.query';

@QueryHandler(RetrieveJumpointNodesQuery)
export class RetrieveJumpointNodesQueryHandler implements IQueryHandler<RetrieveJumpointNodesQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveJumpointNodesQuery): Promise<JumpointNodeRetrievedDtoOutput[]> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.jumpoint.path,
            query.jumpointId.toString(),
            this.appConfigService.beyondTrust.api.jumpoint.node.path,
        );

        return await this.httpClientService.get<JumpointNodeRetrievedDtoOutput, JumpointNodeRetrievedDtoOutput[]>(
            JumpointNodeRetrievedDtoOutput,
            url,
        );
    }
}
