import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveTeamsDtoInput } from '../../dtos/inputs';
import { TeamRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveTeamsQuery } from '../retrieve-teams.query';

@QueryHandler(RetrieveTeamsQuery)
export class RetrieveTeamsQueryHandler implements IQueryHandler<RetrieveTeamsQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveTeamsQuery): Promise<TeamRetrievedDtoOutput[]> {
        const urlPath = UrlUtility.join(
            this.appConfigService.beyondTrust.api.config.path,
            this.appConfigService.beyondTrust.api.config.team.path,
        );

        return await this.httpClientService.get<TeamRetrievedDtoOutput, TeamRetrievedDtoOutput[]>(
            TeamRetrievedDtoOutput,
            query.transactionId,
            query.beyondtrustInstanceId,
            urlPath,
            RetrieveTeamsDtoInput.create(query.pageSize, query.pageNumber, query.name, query.codeName),
        );
    }
}
