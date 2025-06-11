import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveTeamsDtoInput } from '../../dtos/inputs';
import { TeamUserRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveTeamUsersQuery } from '../retrieve-team-users.query';

@QueryHandler(RetrieveTeamUsersQuery)
export class RetrieveTeamUsersQueryHandler implements IQueryHandler<RetrieveTeamUsersQuery> {
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpClientService: HttpClientService,
    ) {}

    public async execute(query: RetrieveTeamUsersQuery): Promise<TeamUserRetrievedDtoOutput[]> {
        const url = UrlUtility.join(
            this.appConfigService.beyondTrust.api.baseUrl,
            this.appConfigService.beyondTrust.api.team.path,
            query.id.toString(),
            this.appConfigService.beyondTrust.api.team.user.path,
        );

        return await this.httpClientService.get<TeamUserRetrievedDtoOutput, TeamUserRetrievedDtoOutput[]>(
            TeamUserRetrievedDtoOutput,
            url,
            RetrieveTeamsDtoInput.create(query.pageSize, query.pageNumber),
        );
    }
}
