import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveJumpClientsDtoInput } from '../../dtos/inputs';
import { JumpClientRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveJumpClientsQuery } from '../retrieve-jump-clients.query';

@QueryHandler(RetrieveJumpClientsQuery)
export class RetrieveJumpClientsQueryHandler implements IQueryHandler<RetrieveJumpClientsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveJumpClientsQuery): Promise<JumpClientRetrievedDtoOutput[]> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.path.jumpClient,
        );

        return await this.httpClientService.get<JumpClientRetrievedDtoOutput, JumpClientRetrievedDtoOutput[]>(
            JumpClientRetrievedDtoOutput,
            url,
            RetrieveJumpClientsDtoInput.create(
                query.pageSize,
                query.pageNumber,
                query.name,
                query.hostname,
                query.fqdn,
                query.tag,
                query.jumpGroupId,
                query.jumpGroupType,
                query.consoleUser,
                query.publicIp,
                query.privateIp,
                query.connectionType,
            ),
        );
    }
}
