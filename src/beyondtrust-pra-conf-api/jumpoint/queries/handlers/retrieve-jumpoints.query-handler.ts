import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveJumpointsDtoInput } from '../../dtos/inputs';
import { JumpointRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveJumpointsQuery } from '../retrieve-jumpoints.query';

@QueryHandler(RetrieveJumpointsQuery)
export class RetrieveJumpointsQueryHandler implements IQueryHandler<RetrieveJumpointsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveJumpointsQuery): Promise<JumpointRetrievedDtoOutput[]> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.path.jumpoint,
        );

        return await this.httpClientService.get<JumpointRetrievedDtoOutput, JumpointRetrievedDtoOutput[]>(
            JumpointRetrievedDtoOutput,
            url,
            RetrieveJumpointsDtoInput.create(
                query.pageSize,
                query.pageNumber,
                query.name,
                query.publicIp,
                query.privateIp,
                query.hostname,
                query.codeName,
            ),
        );
    }
}
